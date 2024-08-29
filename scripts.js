// INICIA O FIREBASE
var firebaseConfig = {
    apiKey: "AIzaSyCKGPO72_JeOmgvt1KPjoDBBcezKDPBzHA",
    authDomain: "notinhas-966fe.firebaseapp.com",
    projectId: "notinhas-966fe",
    storageBucket: "notinhas-966fe.appspot.com",
    messagingSenderId: "607854523953",
    appId: "1:607854523953:web:643c16a8ed7a143b144710"
};
firebase.initializeApp(firebaseConfig);

// CARREGA OS EVENTOS SE USER ESTIVER LOGADO
document.addEventListener("DOMContentLoaded", function() {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            const notesList = document.getElementById("notes-list");
            const loadingMessage = document.getElementById("loading-message");
            const addNoteButton = document.getElementById("logo");
            const noteDetails = document.getElementById("note-details");
            const noteTitle = document.getElementById("note-title");
            const noteBody = document.getElementById("note-body");
            const deleteNoteButton = document.getElementById("delete-note");
            const togglePinButton = document.getElementById("toggle-pin");
            const deleteConfirmation = document.getElementById("delete-confirmation");
            const confirmDeleteButton = document.getElementById("confirm-delete");
            const cancelDeleteButton = document.getElementById("cancel-delete");
            const noteToDeleteSpan = document.getElementById("note-to-delete");
            const home = document.getElementById("home");
            const colorPicker = document.getElementById("color-picker");
            const numeroNotas = document.getElementById("numero-notas");

            const db = firebase.firestore();
            let notes = [];
            let currentNoteId = null;

            // MOSTRA E-MAIL DO USUÁRIO
            const usuario = document.getElementById("usuario")
            usuario.innerText = user.email
            usuario.title = user.email

            // Função para obter e mostrar o número de notas
            function getNumberOfNotes() {
                db.collection("notes").where("userId", "==", userId).get()
                    .then(snapshot => {
                        const numberOfNotes = snapshot.size;
                        numeroNotas.innerText = numberOfNotes;
                    })
            }

            // Chama a função para mostrar o número de notas no console
            getNumberOfNotes();

            // Função para mostrar as notas do usuário
            function renderNotesList() {
                notesList.innerHTML = "";
                const pinnedNotes = notes.filter(note => note.pinned).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                const unpinnedNotes = notes.filter(note => !note.pinned).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                [...pinnedNotes, ...unpinnedNotes].forEach(note => {
                    const li = document.createElement("li");
                    li.textContent = (note.pinned ? "📌 " : "") + (note.title || "Nova página");
                    li.dataset.id = note.id;
                    li.addEventListener("click", () => selectNote(note.id));
                    if (note.id === currentNoteId) {
                        li.classList.add("selected-note");
                    }
                    notesList.appendChild(li);
                });
            }

            // Função de selecionar uma nota
            function selectNote(id) {
                currentNoteId = id;
                const note = notes.find(n => n.id === id);
                if (note) {
                    noteTitle.value = note.title;
                    noteBody.innerHTML = note.body;
                    home.classList.add("hidden");
                    noteDetails.classList.remove("hidden");

                    const selectedNote = notesList.querySelector(".selected-note");
                    if (selectedNote) {
                        selectedNote.classList.remove("selected-note");
                    }

                    const li = notesList.querySelector(`li[data-id="${id}"]`);
                    if (li) {
                        li.classList.add("selected-note");
                    }
                }
            }

            // Função para salvar a nota
            function saveNote(note) {
                if (note.id) {
                    db.collection("notes").doc(note.id).set(note)
                        .then(() => renderNotesList())
                        .catch((error) => console.error("Erro ao salvar nota: ", error));
                }
            }

            // Função para heading
            function toggleHeading() {
                const selection = window.getSelection();
                const selectedNode = selection.anchorNode.parentNode;
                if (selectedNode.tagName === "h3") {
                    document.execCommand('formatBlock', false, 'p');
                } else {
                    document.execCommand('formatBlock', false, 'h3');
                }
            }

            // Função para listas não numeradas
            function toggleUnorderedList() {
                document.execCommand('insertUnorderedList');
            }

            // Função para salvar o título
            noteTitle.addEventListener("input", () => {
                const note = notes.find(n => n.id === currentNoteId);
                note.title = noteTitle.value;
                saveNote(note);
            });

            // Função para salvar o corpo da nota (perda do foco da div)
            noteBody.addEventListener("blur", () => {
                const note = notes.find(n => n.id === currentNoteId);
                note.body = noteBody.innerHTML;
                saveNote(note);
            });

            // Botão de adicionar nova nota (logo)
            addNoteButton.addEventListener("click", () => {
                const newNote = {
                    id: db.collection("notes").doc().id,
                    title: "",
                    body: "",
                    pinned: false,
                    userId: userId
                };
                notes.push(newNote);
                saveNote(newNote);
                selectNote(newNote.id);
            });

            // Botão de deletar nota (chama o pop-up)
            deleteNoteButton.addEventListener("click", () => {
                const note = notes.find(n => n.id === currentNoteId);
                if (note) {
                    noteToDeleteSpan.textContent = note.title || "Nova página";
                    deleteConfirmation.classList.remove("hidden");
                }
            });

            // Botão de confirmar a exclusão da nota no pop-up
            confirmDeleteButton.addEventListener("click", () => {
                db.collection("notes").doc(currentNoteId).delete()
                    .then(() => {
                        notes = notes.filter(note => note.id !== currentNoteId);
                        currentNoteId = null;
                        deleteConfirmation.classList.add("hidden");
                        noteDetails.classList.add("hidden");
                        home.classList.remove("hidden");
                        renderNotesList();
                        getNumberOfNotes();
                    })
                    .catch((error) => console.error("Erro ao deletar nota: ", error));
            });

            // Botão de fechar o pop-up de exclusão da nota
            cancelDeleteButton.addEventListener("click", () => {
                deleteConfirmation.classList.add("hidden");
            });

            // Botão de fixar ou desfixar a nota
            togglePinButton.addEventListener("click", () => {
                const note = notes.find(n => n.id === currentNoteId);
                if (note) {
                    note.pinned = !note.pinned;
                    saveNote(note);
                    renderNotesList();
                }
            });

            db.collection("notes").where("userId", "==", userId).onSnapshot((snapshot) => {
                notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderNotesList();
                loadingMessage.style.display = "none"; // Remove a mensagem de carregamento
                if (currentNoteId) {
                    selectNote(currentNoteId);
                }
            });

            // Adiciona evento de entrada para o color picker
            colorPicker.addEventListener("input", () => {
                document.execCommand("foreColor", false, colorPicker.value);
                noteBody.focus();
            });

            // Adiciona os atalhos de teclado
            document.addEventListener("keydown", (event) => {
                if (event.ctrlKey) {
                    switch (event.key) {
                        case 'p':
                            event.preventDefault();
                            colorPicker.click();
                            break;
                        case 'l':
                            event.preventDefault();
                            toggleUnorderedList();
                            break;
                        case 'h':
                            event.preventDefault();
                            toggleHeading();
                            break;
                    }
                }
            });

            // LOGOUT
            document.getElementById("logout").addEventListener("click", () => {
                firebase.auth().signOut().then(() => {
                    window.location.href = "login.html";
                }).catch((error) => {
                    console.error("Erro ao sair: ", error);
                });
            });
        }
    });
});
