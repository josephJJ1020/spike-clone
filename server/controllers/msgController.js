const mongoose = require("mongoose");
const ConversationSchema = require("../schemas/Conversation");
const { User } = require("./controller");

const { v4: uuid } = require("uuid");

const Conversation = mongoose.model("Conversation", ConversationSchema);

const msgController = {
  // get all conversations where the user is a participant
  getUserConversations: async (userId) => {
    return await Conversation.find({ participants: userId });
  },

  // makes new conversation document in db; takes in an array of users; add convo Id to each user's conversations attribute
  makeConversation: async (users) => {
    const newConvo = new Conversation({ participants: users });
    await newConvo.save();

    users.forEach(async (userId) => {
      let user = await User.findById(userId);
      user.conversations.push(newConvo._id);
      user.save();
    });

    return Conversation.findById(newConvo._id);
  },

  // add message to conversation; takes in user {id, firstName, lastName}, message {conversationId, id (created with uuid), to, from, content}
  // and conversation id
  // message.to format: {id, firstName, lastName}

  addMessage: async (user, message, convoId) => {
    // check if conversation id is specified; if not, make new one (might delete this one later)
    if (!convoId) {
      let convo = new Conversation({
        participants: [message.to.id, user.id],
        messsages: [
          {
            id: uuid().slice(0, 6),
            from: user,
            content: message.content,
            dateCreated: Date.now(),
          },
        ],
      });
      
      convo.messages[0].conversationId = convo._id;
      await convo.save();
      return await Conversation.findById(convo._id);
    }

    let convo = await Conversation.findById(convoId);

    if (convo) {
      // check first if user id is in convo, then add message to convo
      if (convo.participants.includes(user.id)) {
        convo.messages.push({
          conversationId: convo._id,
          id: uuid().slice(0, 6),
          from: user,
          content: message.content,
          dateCreated: Date.now(),
        });

        convo.save();
        return await Conversation.findById(convo._id);
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
