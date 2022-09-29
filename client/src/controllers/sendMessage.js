const sendMessage = async ({user, message, convoId,}) => {
    await fetch(process.env.REACT_APP_MESSAGE_URI, {
        method: 'post',
        body: JSON.stringify({
            
        })
    })
}