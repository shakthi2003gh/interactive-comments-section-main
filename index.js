const commentContainer = document.querySelector(".text-container");
let data;

fetch("./data.json")
  .then((blob) => blob.json())
  .then((blob) => {
    data = blob;
    comment();
  })
  .catch((error) => console.log(error));

function comment() {
  const comments = data.comments;

  const displayComments = comments.map((comment) => {
    return `<div class="comment card" id=${comment.id}>
        <div class="header">
            <img src="${comment.user.image.webp}" class="profile" alt="" />
            <span class="name">${comment.user.username}</span>
            <span class="date">${comment.createdAt}</span>
        </div>

        <div class="body">
            <p>
               ${comment.content}
            </p>
        </div>

        <div class="score clr-primary">
            <span class="hover">+</span>
            <span>${comment.score}</span>
            <span class="hover">-</span>
        </div>

        ${userEditButton(comment.user.username)}
    </div>

    ${replies(comment.replies)}
    `;
  });

  commentContainer.innerHTML = displayComments.join("");
}

function replies(comment) {
  if (comment.length === 0) return [];

  const displayReplies = comment
    .map((reply) => {
      console.log(reply);
      if (reply.content === "")
        return `<div class="text-area card">
          <textarea class="hover" placeholder="Add a comment..."></textarea>

          <img src="/images/avatars/image-juliusomo.png" class="profile" alt="" />

          <button class="primary hover reply">REPLY</button>
        </div>`;

      return `<div class="comment card" id=${reply.id}>
        <div class="header">
            <img src="${reply.user.image.webp}" class="profile" alt="" />
            <span class="name">${reply.user.username} ${currentUserTag(
        reply.user.username
      )}</span>
            <span class="date">${reply.createdAt}</span>
        </div>

        <div class="body">
          <p>
            <span class="clr-primary">@${reply.replyingTo}</span>
            ${reply.content}
          </p>
        </div>

        <div class="score clr-primary">
            <span class="hover">+</span>
            <span>${reply.score}</span>
            <span class="hover">-</span>
        </div>

        ${userEditButton(reply.user.username)}
    </div>`;
    })
    .join("");

  return `<div class="replies container">${displayReplies}</div>`;
}

function currentUserTag(userName) {
  const user = data.currentUser;

  if (userName === user.username)
    return `<span class="self clr-white bg-primary">you</span>`;

  return [];
}

function userEditButton(userName) {
  const user = data.currentUser;

  if (userName === user.username)
    return `<div class="button">
              <button class="clr-secondary hover delete">delete</button>
              <button class="clr-primary hover edit">Edit</button>
            </div>`;

  return `<div class="button">
            <button class="clr-primary hover reply">Reply</button>
          </div>`;
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(addListener, 500);
});

function addListener() {
  const replyButton = document.querySelectorAll("button.reply");
  const editButton = document.querySelectorAll("button.edit");
  const deleteButton = document.querySelectorAll("button.delete");
  const sendButton = document.querySelectorAll("button.send");

  const replyContainer = document.createElement("div");
  replyContainer.classList.add("replies");
  replyContainer.classList.add("container");

  replyButton.forEach((button) =>
    button.addEventListener("click", (e) => {
      const currentUser = data.currentUser;
      const comments = data.comments;
      const id = e.target.closest(".comment").id;

      comments.forEach((comment) => {
        if (comment.id == id) {
          comment.replies.push({
            id: new Date() - 0,
            content: "",
            createdAt: "today",
            replyingTo: comment.user.username,
            score: 0,
            user: currentUser,
          });
        }
      });

      comment();
      addListener();
    })
  );

  editButton.forEach((button) =>
    button.addEventListener("click", (e) => {
      button.setAttribute("disabled", "true");
      button.previousElementSibling.setAttribute("disabled", "true");
      const comment = e.target.closest(".card");
      const body = comment.querySelector(".body");

      let replyTo = "";
      if (e.target.closest(".container").classList.contains("replies")) {
        replyTo = body.querySelector(".body span").innerText;
        body.querySelector("span").innerHTML = "";
      }

      const content = body.innerText;

      body.innerHTML = `<textarea class="hover">${content}</textarea>`;

      comment.innerHTML =
        comment.innerHTML +
        `<button class="primary hover update">UPDATE</button>`;

      const updateButton = comment.querySelector("button.update");
      updateButton.addEventListener("click", (e) => {
        const content = comment.querySelector("textarea").value;

        comment.querySelector(".body").innerHTML = `<p>
          <span class="clr-primary">${replyTo}</span>
          ${content}
        </p>`;

        comment.querySelector("button.edit").removeAttribute("disabled");
        comment.querySelector("button.delete").removeAttribute("disabled");
        addListener();

        comment.removeChild(e.target);
      });
    })
  );

  deleteButton.forEach((button) =>
    button.addEventListener("click", (e) => {
      const container = e.target.closest(".container");
      const comment = e.target.closest(".comment");
      container.removeChild(comment);
    })
  );

  sendButton.forEach((button) =>
    button.addEventListener("click", () => {
      const user = data.currentUser;
      const mainTextArea = document.querySelector(".text-area textarea");
      const content = mainTextArea.value;
      if (content.trim() === "") return;

      const displayComment = `<div class="comment card" id=${new Date() - 0}>
        <div class="header">
            <img src="${user.image.webp}" class="profile" alt="" />
            <span class="name">${user.username}${currentUserTag(
        user.username
      )}</span>
            <span class="date">Today</span>
            </div>

        <div class="body">
            <p>
              ${content}
              </p>
              </div>
              
        <div class="score clr-primary">
            <span class="hover">+</span>
            <span>0</span>
            <span class="hover">-</span>
        </div>
        
        ${userEditButton(user.username)}
    </div>`;
      commentContainer.innerHTML = commentContainer.innerHTML + displayComment;
      mainTextArea.value = "";
      addListener();
    })
  );
}
