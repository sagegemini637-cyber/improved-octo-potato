async function askAI(){

const question = document.getElementById("ai-question").value;

const response = await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer YOUR_API_KEY"
},
body:JSON.stringify({
model:"gpt-4o-mini",
messages:[
{role:"system",content:"You are a business analytics assistant"},
{role:"user",content:question}
]
})
});

const data = await response.json();

document.getElementById("ai-response").innerText =
data.choices[0].message.content;

}
