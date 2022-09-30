const mongoose = require("mongoose");
const ConversationSchema = require("../schemas/Conversation");
const { User } = require("./controller");

const { v4: uuid } = require("uuid");

const Conversation = mongoose.model("Conversation", ConversationSchema);

const msgController = {
  // get all conversations where the user is a participant
  getUserConversations: async (email) => {
    return await Conversation.find({ "participants.email": email });
  },

  getConversationByParticipants: async (participants) => {
    try {
      return await Conversation.findOne(
        { participants: participants },

      );
    } catch (err) {
      console.log(err.message)
    }
  },

  // makes new conversation document in db; takes in an array of users; add convo Id to each user's conversations attribute
  makeConversation: async (users) => {
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

  addMessage: async (user, message, convoId, filesList) => {
    console.log(`filesList in controller: ${filesList}`);
    // check if conversation id is specified; if not, make new one (might delete this one later)
    if (!convoId) {
      let convo = new Conversation({
        participants: [message.to, user],
        messsages: [],
      });

      await Conversation.findByIdAndUpdate(convo._id, {
        $push: {
          messages: {
            conversationId: null,
            id: uuid().slice(0, 6),
            from: user,
            content: message.content,
            files: filesList,
            dateCreated: Date.now(),
          },
        },
      });

      // convo.messages.push({
      //   conversationId: null,
      //   id: uuid().slice(0, 6),
      //   from: user,
      //   content: message.content,
      //   dateCreated: Date.now(),
      // });
      await convo.save();

      return convo;
    }

    let convo = await Conversation.findById(convoId);

    if (convo) {
      // check first if user id is in convo, then add message to convo
      if (
        convo.participants.some(
          (participant) => participant.email === user.email
        )
      ) {
        convo.messages.push({
          conversationId: convo._id,
          id: uuid().slice(0, 6),
          from: user,
          content: message.content,
          files: filesList,
          dateCreated: Date.now(),
        });

        convo.save();
        return convo;
      } else {
        return new Error("User is not in Conversation");
      }
    } else {
      return new Error("Conversation does not exist");
      // return error
    }
  },
};

module.exports = msgController;
