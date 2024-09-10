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
            const barreira = document.getElementById("container");
            const logo = document.querySelector(".logo");
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
            const toggleDark = document.getElementById("dark-mode");

            const db = firebase.firestore();
            let notes = [];
            let currentNoteId = null;

            const usuario = document.getElementById("usuario")
            const userDiv = document.getElementById("user")
            usuario.innerText = user.email
            userDiv.title = user.email

            const storedMode = localStorage.getItem('theme');
            if (storedMode === 'dark-mode') {
                applyDarkMode();
            } else {
                applyLightMode();
            }

            barreira.style.display = 'flex'

            toggleDark.addEventListener("click", () => {
                if (document.body.classList.contains('light-mode')) {
                    applyDarkMode();
                    localStorage.setItem('theme', 'dark-mode');
                } else {
                    applyLightMode();
                    localStorage.setItem('theme', 'light-mode');
                }
            });

            logo.addEventListener("click", () => {
                location.reload();
            });

            function applyDarkMode() {
                const items = document.querySelectorAll('.sidebar ul li');
                const usuario = document.getElementById('user');
                const botoes = document.querySelectorAll('.note-actions button');
                const help = document.querySelectorAll('.help');
                const botaoDark = document.getElementById('dark-mode');
                const h3 = document.getElementById('h3');
                const sidebar = document.querySelector('.sidebar');
                
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');
                sidebar.classList.remove('light-mode');
                sidebar.classList.add('dark-mode');
                noteDetails.classList.remove('light-mode');
                noteDetails.classList.add('dark-mode');
                usuario.classList.remove('light-mode');
                usuario.classList.add('dark-mode');
                botaoDark.classList.remove('light-mode');
                botaoDark.classList.add('dark-mode');
                h3.style.color = "#DBDBDB";
                items.forEach(item => {
                    item.classList.remove('light-mode');
                    item.classList.add('dark-mode');
                });
                botoes.forEach(item => {
                    item.classList.remove('light-mode');
                    item.classList.add('dark-mode');
                });
                help.forEach(item => {
                    item.classList.remove('light-mode');
                    item.classList.add('dark-mode');
                });
            }

            function applyLightMode() {
                const items = document.querySelectorAll('.sidebar ul li');
                const usuario = document.getElementById('user');
                const botoes = document.querySelectorAll('.note-actions button');
                const help = document.querySelectorAll('.help');
                const botaoDark = document.getElementById('dark-mode');
                const h3 = document.getElementById('h3');
                const sidebar = document.querySelector('.sidebar');
                
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');
                sidebar.classList.remove('dark-mode');
                sidebar.classList.add('light-mode');
                noteDetails.classList.remove('dark-mode');
                noteDetails.classList.add('light-mode');
                usuario.classList.remove('dark-mode');
                usuario.classList.add('light-mode');
                botaoDark.classList.remove('dark-mode');
                botaoDark.classList.add('light-mode');
                h3.style.color = "#111";
                items.forEach(item => {
                    item.classList.remove('dark-mode');
                    item.classList.add('light-mode');
                });
                botoes.forEach(item => {
                    item.classList.remove('dark-mode');
                    item.classList.add('light-mode');
                });
                help.forEach(item => {
                    item.classList.remove('dark-mode');
                    item.classList.add('light-mode');
                });
            }

            function renderNotesList() {
                notesList.innerHTML = "";
                const pinnedNotes = notes.filter(note => note.pinned).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                const unpinnedNotes = notes.filter(note => !note.pinned).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                [...pinnedNotes, ...unpinnedNotes].forEach(note => {
                    const li = document.createElement("li");
                    li.innerHTML = (note.pinned ? "<i class='las la-thumbtack' style='font-size: 20px;'></i>" : "") + (note.title || "Nova página");
                    li.dataset.id = note.id;
                    li.addEventListener("click", () => selectNote(note.id));
                    if (note.id === currentNoteId) {
                        li.classList.add("selected-note");
                    }
                    notesList.appendChild(li);
                });
                const items = document.querySelectorAll('.sidebar ul li');
                if (document.body.classList.contains('light-mode')) {
                    items.forEach(item => {
                        item.classList.add('light-mode');
                    });
                } else {
                    items.forEach(item => {
                        item.classList.add('dark-mode');
                    });
                }
            }

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

            function saveNote(note) {
                if (note.id) {
                    db.collection("notes").doc(note.id).set(note)
                        .then(() => renderNotesList())
                        .catch((error) => console.error("Erro ao salvar nota: ", error));
                }
            }

            function toggleHeading() {
                const selection = window.getSelection();
                const selectedNode = selection.anchorNode.parentNode;
                if (selectedNode.tagName === "h3") {
                    document.execCommand('formatBlock', false, 'p');
                } else {
                    document.execCommand('formatBlock', false, 'h3');
                }
            }

            function toggleUnorderedList() {
                document.execCommand('insertUnorderedList');
            }

            noteTitle.addEventListener("input", () => {
                const note = notes.find(n => n.id === currentNoteId);
                note.title = noteTitle.value;
                saveNote(note);
            });

            noteBody.addEventListener("blur", () => {
                const note = notes.find(n => n.id === currentNoteId);
                note.body = noteBody.innerHTML;
                saveNote(note);
            });

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

            deleteNoteButton.addEventListener("click", () => {
                const note = notes.find(n => n.id === currentNoteId);
                if (note) {
                    noteToDeleteSpan.textContent = note.title || "Nova página";
                    deleteConfirmation.classList.remove("hidden");
                }
            });

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

            cancelDeleteButton.addEventListener("click", () => {
                deleteConfirmation.classList.add("hidden");
            });

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
                loadingMessage.style.display = "none";
                if (currentNoteId) {
                    selectNote(currentNoteId);
                }
            });

            colorPicker.addEventListener("input", () => {
                document.execCommand("foreColor", false, colorPicker.value);
                noteBody.focus();
            });

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
