const mongoose = require("mongoose");
const ConversationSchema = require("../schemas/Conversation");
const { User } = require("./controller");

const { v4: uuid } = require("uuid");

const Conversation = mongoose.model("Conversation", ConversationSchema);

const msgController = {
  // get all conversations where the user is a participant
  getUserConversations: async (email) => {
    // find conversations and sort
    return await Conversation.aggregate([
      { $match: { "participants.email": email } },
      // {
      //   $set: {
      //     messages: {
      //       $sortArray: {
      //         input: "$messages",
      //         sortBy: { dateCreated: 1 },
      //       },
      //     },
      //   },
      // },
      { $unwind: "$messages" },
      {
        $sort: {
          "messages.dateCreated": 1,
        },
      },

      {
        $group: {
          _id: "$_id",
          identifier: { $first: "$identifier" },
          dateCreated: { $first: "$dateCreated" },
          participants: { $first: "$participants" },
          messages: { $push: "$messages" },
        },
      },
      {
        $set: {
          messages: {
            $slice: ["$messages", -10],
          },
        },
      },
      {
        $sort: {
          identifier: 1,
        },
      },
    ]);
  },

  lazyLoadConversation: async (convoId, latestLimit) => {
    const newLimit = 10 + latestLimit;

    const convo = await Conversation.findById(convoId);

    const newConvo = await Conversation.aggregate([
      {
        $match: {
          _id: convo._id,
        },
      },
      { $unwind: "$messages" },
      {
        $sort: {
          "messages.dateCreated": 1,
        },
      },

      {
        $group: {
          _id: "$_id",
          dateCreated: { $first: "$dateCreated" },
          participants: { $first: "$participants" },
          messages: { $push: "$messages" },
        },
      },
      {
        $set: {
          messages: {
            $slice: ["$messages", -newLimit],
          },
        },
      },
    ]);

    // const newConvo = await Conversation.aggregate([
    //   { $match: { _id: convo._id } },
    //   {
    //     $set: {
    //       messages: {
    //         $sortArray: {
    //           input: "$messages",
    //           sortBy: { dateCreated: 1 },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $set: {
    //       messages: {
    //         $slice: ["$messages", -newLimit],
    //       },
    //     },
    //   },
    // ]);

    if (newConvo) return newConvo[0];
  },

  getConversationByParticipants: async (participants) => {
    try {
      const newConvo = await Conversation.findOne({
        participants: { $size: participants.length, $all: participants },
      });

      if (newConvo) {
        return newConvo;
      }
    } catch (err) {
      console.log(err.message);
    }
  },

  getConversationsByIdentifier: async () => {
    return [...(await Conversation.find({}, { identifier: 1 }))];
  },

  // makes new conversation (with messages); run in fetchEmail.js
  makeConversationWithMessages: async (identifier, participants, messages) => {
    const newConvo = new Conversation({
      identifier,
      dateCreated: Date.now(),
      participants,
      messages,
    });

    await newConvo.save();
    return newConvo;
  },

  // add message to conversation; run in fetchEmail.js
  AddMessageToConversation: async (identifier, message) => {
    const convo = await Conversation.findOne({ identifier: identifier });

    if (convo) {
      if (
        convo.messages.find(
          (msg) =>
            msg.messageId === message.messageId ||
            msg.content === message.content
        )
      ) {
        // do nothing
        // console.log(`message with id ${message.messagId} already exists`);
      } else {
        convo.messages.push(message);

        await convo.save();
      }
    }
  },

  // makes new conversation document in db; takes in an array of users; add convo Id to each user's conversations attribute
  makeConversation: async (users) => {
    console.log("making convo");
    const newConvo = new Conversation({ participants: users });
    await newConvo.save();

    users.forEach(async (user) => {
      if (await User.findOne({ email: user.email })) {
        await User.updateOne(
          { email: user.email },
          { $push: { conversations: newConvo._id } }
        );
      }
    });

    return Conversation.findById(newConvo._id);
  },

  addMessage: async (
    user,
    message,
    convoId,
    filesList,
    messagId = null,
    dateCreated
  ) => {
    // check if conversation id is specified; if not, make new one (might delete this one later)
    if (!convoId) {
      let convo = new Conversation({
        participants: [...message.to, user],
        messsages: [],
      });

      await convo.save();

      // no need to aggregate/sort messages here since we're pushing the first message of the conversation
      const newConvo = await Conversation.findByIdAndUpdate(
        convo._id,
        {
          $push: {
            messages: {
              conversationId: null,
              id: messagId ? messagId : uuid().slice(0, 6),
              from: user,
              content: message.content,
              files: filesList,
              dateCreated: dateCreated ? dateCreated : Date.now(),
              read: [user.email],
            },
          },
        },
        { new: true }
      );

      await newConvo.save();

      return newConvo;
    }

    let convo = await Conversation.findById(convoId);

    if (convo) {
      // check first if user id is in convo, then add message to convo
      if (
        convo.participants.some(
          (participant) => participant.email === user.email
        )
      ) {
        // push message to conversation's messages field
        await convo.messages.push({
          conversationId: convo._id,
          id: messagId ? messagId : uuid().slice(0, 6),
          from: user,
          content: message.content,
          files: filesList,
          dateCreated: dateCreated ? dateCreated : Date.now(),
          read: [user.email],
        });

        await convo.save();

        const newConvo = await Conversation.aggregate(
          [
            {
              $match: { _id: convo._id },
            },

            // {
            //   $set: {
            //     messages: {
            //       $sortArray: {
            //         input: "$messages",
            //         sortBy: { dateCreated: 1 },
            //       },
            //     },
            //   },
            // },
            { $unwind: "$messages" },
            {
              $sort: {
                "messages.dateCreated": 1,
              },
            },

            {
              $group: {
                _id: "$_id",
                dateCreated: { $first: "$dateCreated" },
                participants: { $first: "$participants" },
                messages: { $push: "$messages" },
              },
            },
            {
              $set: {
                messages: {
                  $slice: ["$messages", -10],
                },
              },
            },
          ],
          { $new: true }
        );

        return newConvo[0]; // return first document since aggregate returns an array
      } else {
        return new Error("User is not in Conversation");
      }
    } else {
      return new Error("Conversation does not exist");
      // return error
    }
  },

  // mark all convo's messages as read
  markConvoMessagesAsRead: async (email, convoId) => {
    const convo = await Conversation.findById(convoId);

    if (convo) {
      let newMessages = convo.messages.map((message) => {
        if (message.read && !message.read.includes(email)) {
          message.read.push(email);
          return message;
        }
        return message;
      });

      await Conversation.findByIdAndUpdate(convo._id, {
        messages: newMessages,
      });

      return true;
    }
  },
};

module.exports = msgController;
