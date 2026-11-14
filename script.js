const startButton = document.getElementById("startButton");
const continueButton = document.getElementById("continueButton");

const welcomeScreen = document.getElementById("welcomeScreen");
const messageScreen = document.getElementById("messageScreen");
const feelingsScreen = document.getElementById("feelingsScreen");

const yesButton = document.getElementById("yesButton");
const timeButton = document.getElementById("timeButton");
const noButton = document.getElementById("noButton");

const sendMessageButton = document.getElementById("sendMessageButton");

const messageInput = document.getElementById("messageInput");
const feelingsInput = document.getElementById("feelingsInput");


// FIRST SCREEN
startButton.addEventListener("click", function () {

    welcomeScreen.classList.add("hidden");
    messageScreen.classList.remove("hidden");

});


// SECOND SCREEN
continueButton.addEventListener("click", function () {

    messageScreen.classList.add("hidden");
    feelingsScreen.classList.remove("hidden");

});


// FORMSPREE SUBMISSION
async function showResponse(message) {

    const endpoint = "https://formspree.io/f/maeoqpwn";

    const additionalMessage = feelingsInput.value.trim();
    const earlierMessage = messageInput.value.trim();

    yesButton.disabled = true;
    timeButton.disabled = true;
    noButton.disabled = true;
    sendMessageButton.disabled = true;

    try {

        const response = await fetch(endpoint, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({

                response: message,

                earlierMessage: earlierMessage,

                additionalMessage: additionalMessage,

                timestamp: new Date().toISOString(),

                website: "Akua"

            })

        });

        if (!response.ok) {
            throw new Error("Submission failed");
        }

        feelingsScreen.innerHTML = `
            <h1>Thank You, Jackie ❤️</h1>
            <p>${message}</p>
            <p>Whatever your answer, I appreciate your honesty.</p>
        `;

        console.log("Successfully sent to Formspree!");

    }

    catch (error) {

        console.error("Formspree error:", error);

        alert("Your response could not be sent. Please try again.");

        yesButton.disabled = false;
        timeButton.disabled = false;
        noButton.disabled = false;
        sendMessageButton.disabled = false;

    }

}


// CONNECT THE THREE RESPONSE BUTTONS

yesButton.addEventListener("click", function () {

    showResponse("I'd like that ❤️");

});


timeButton.addEventListener("click", function () {

    showResponse("I'd like some time to think.");

});


noButton.addEventListener("click", function () {

    showResponse("I don't feel the same way.");

});


// CONNECT THE PERSONAL MESSAGE BUTTON

sendMessageButton.addEventListener("click", function () {

    const personalMessage = feelingsInput.value.trim();

    if (!personalMessage) {

        alert("Please write a message first.");

        return;

    }

    showResponse("Jackie's personal message");

});