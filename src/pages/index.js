import "../pages/index.css";
import {
  enableValidation,
  resetFormValidation,
  disableButton,
  config,
} from "../scripts/validation.js";

import logo from "../images/logo.svg";
import avatar from "../images/avatar.jpg";
import pencilIcon from "../images/pencil.svg";
import plusIcon from "../images/plus.svg";
import Api from "../utils/Api.js";

document.querySelector(".header__logo").src = logo;
document.querySelector(".profile__avatar").src = avatar;
document.querySelector(".profile__edit-btn img").src = pencilIcon;
document.querySelector(".profile__add-btn img").src = plusIcon;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "02543b60-f2a8-4764-b91d-a231c86d92a2",
    "Content-Type": "application/json",
  },
});

const cardsListEl = document.querySelector(".cards__list");
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = document.forms["edit-profile-form"];
const editProfileNameInput = editProfileForm.elements["profile-name-input"];
const editProfileDescriptionInput =
  editProfileForm.elements["profile-description-input"];

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const addCardFormElement = document.forms["new-post-form"];
const nameInput = newPostModal.querySelector("#card-caption-input");
const linkInput = newPostModal.querySelector("#card-image-input");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const cardTemplate = document.querySelector("#card-template").content;
const previewModal = document.querySelector("#preview-modal");
const previewImage = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarFormElement = document.querySelector("#edit-avatar-form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarEditBtn = document.querySelector(".profile__avatar-btn");
const confirmDeleteModal = document.querySelector("#confirm-delete-modal");
const confirmDeleteForm = confirmDeleteModal.querySelector(".modal__form");
const cancelDeleteBtn = confirmDeleteModal.querySelector(".modal__cancel-btn");

cancelDeleteBtn.addEventListener("click", () => closeModal(confirmDeleteModal));

let selectedCardId = null;
let selectedCardElement = null;

function getCardElement(data, currentUserId) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  const cardLikeCount = cardElement.querySelector(".card__like-count");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;
  cardLikeCount.textContent = Array.isArray(data.likes) ? data.likes.length : 0;

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_active");
  }

  cardImageEl.addEventListener("click", () => {
    previewImage.src = data.link;
    previewImage.alt = data.name;
    previewCaption.textContent = data.name;
    openModal(previewModal);
  });

  cardLikeBtn.addEventListener("click", () => {
    const isLiked = cardLikeBtn.classList.contains("card__like-btn_active");
    const method = isLiked ? api.unlikeCard : api.likeCard;

    method
      .call(api, data._id)
      .then(() => {
        cardLikeBtn.classList.toggle("card__like-btn_active");
      })
      .catch(console.error);
  });

  cardDeleteBtn.addEventListener("click", () => {
    selectedCardId = data._id;
    selectedCardElement = cardElement;
    openModal(confirmDeleteModal);
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}

function handleEditProfileFormSubmit(event) {
  event.preventDefault();
  const saveButton = editProfileModal.querySelector(".modal__submit-btn");
  const originalText = saveButton.textContent;
  saveButton.textContent = "Saving...";

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      saveButton.textContent = originalText;
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const submitButton = addCardFormElement.querySelector(".modal__submit-btn");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Saving...";

  const newCard = {
    name: nameInput.value,
    link: linkInput.value,
  };

  api
    .addNewCard(newCard)
    .then((cardData) => {
      const cardElement = getCardElement(cardData);
      cardsListEl.prepend(cardElement);
      addCardFormElement.reset();
      disableButton(submitButton, config);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      submitButton.textContent = originalText;
    });
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  avatarSubmitBtn.textContent = "Saving...";

  api
    .updateAvatar(avatarInput.value)
    .then((userData) => {
      document.querySelector(".profile__avatar").src = userData.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      avatarSubmitBtn.textContent = "Save";
    });
}

editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetFormValidation(editProfileForm, config);
  openModal(editProfileModal);
});

newPostBtn.addEventListener("click", () => {
  resetFormValidation(addCardFormElement, config);
  openModal(newPostModal);
});

avatarEditBtn.addEventListener("click", () => {
  avatarInput.value = "";
  resetFormValidation(avatarForm, config);
  openModal(avatarModal);
});

confirmDeleteForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  if (!selectedCardId || !selectedCardElement) return;

  const confirmDeleteBtn = confirmDeleteForm.querySelector(".modal__submit-btn");
  const originalText = confirmDeleteBtn.textContent;
  confirmDeleteBtn.textContent = "Deleting...";

  api.removeCard(selectedCardId)
    .then(() => {
      selectedCardElement.remove();
      closeModal(confirmDeleteModal);
      selectedCardId = null;
      selectedCardElement = null;
    })
    .catch(console.error)
    .finally(() => {
      confirmDeleteBtn.textContent = originalText;
    });
});


editProfileForm.addEventListener("submit", handleEditProfileFormSubmit);
addCardFormElement.addEventListener("submit", handleAddCardSubmit);
avatarFormElement.addEventListener("submit", handleAvatarFormSubmit);

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (e) => {
    if (
      e.target.classList.contains("modal") ||
      e.target.classList.contains("modal__close-btn")
    ) {
      closeModal(modal);
    }
  });
});

enableValidation(config);

let currentUserId;

api
  .getAppInfo()
  .then(([cards, user]) => {
    currentUserId = user._id;
    cards.forEach((item) => {
      const cardElement = getCardElement(item, currentUserId);
      cardsListEl.append(cardElement);
    });
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    document.querySelector(".profile__avatar").src = user.avatar;
  })
  .catch(console.error);
