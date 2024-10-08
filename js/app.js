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
            const menu = document.getElementById("menu");
            const overlay = document.getElementById("overlay");
            const todoInput = document.getElementById("input-to-do");
            const todoList = document.getElementById("to-do");
            
            const db = firebase.firestore();
            let notes = [];
            let currentNoteId = null;

            const usuario = document.getElementById("usuario")
            usuario.innerText = user.email
            usuario.title = user.email

            const storedMode = localStorage.getItem('theme');
            if (storedMode === 'dark-mode') {
                applyDarkMode();
            } else {
                applyLightMode();
            }

            barreira.style.display = 'flex'

            todoInput.addEventListener("keypress", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    const todoText = todoInput.value.trim();
                    if (todoText !== "") {
                        addTodo(todoText);
                        todoInput.value = "";
                    }
                }
            });

            menu.addEventListener('click', toggleSidebar);
            overlay.addEventListener('click', toggleSidebar);
            document.getElementById('help').addEventListener('click', function() {
                document.getElementById('comandos').classList.toggle('hidden');
            });

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

            loadTodos();

            function addTodo(text) {
                db.collection("to-do")
                    .where("userId", "==", userId)
                    .orderBy("ordem", "desc")
                    .limit(1)
                    .get()
                    .then((querySnapshot) => {
                        let newOrder = 0;
                        if (!querySnapshot.empty) {
                            const lastTodo = querySnapshot.docs[0].data();
                            newOrder = lastTodo.ordem + 1;
                        }
            
                        db.collection("to-do").add({
                            userId: userId,
                            item: text,
                            ordem: newOrder
                        })
                        .then(() => {
                            loadTodos();
                        });
                    });
            }            

            function loadTodos() {
                todoList.innerHTML = "";
                db.collection("to-do")
                    .where("userId", "==", userId)
                    .orderBy("ordem")
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            const todoItem = doc.data();
                            const todoElement = document.createElement("div");
                            todoElement.className = "to-do " + (document.body.classList.contains("light-mode") ? "light-mode" : "dark-mode");
                            todoElement.dataset.id = doc.id;
                            todoElement.innerHTML = `
                                <i class="las la-grip-lines dragIcon"></i>
                                <span style="width: 100%;">${todoItem.item}</span>
                                <i class="las la-check-circle deleteToDo" style="font-size: 20px;" data-id="${doc.id}"></i>
                            `;
                            todoList.appendChild(todoElement);
            
                            todoElement.querySelector(".deleteToDo").addEventListener("click", function() {
                                const todoId = this.getAttribute("data-id");
                                deleteTodo(todoId);
                            });
                        });
            
                        new Sortable(todoList, {
                            handle: '.dragIcon',
                            animation: 150,
                            onStart: function(evt) {
                                const todos = todoList.querySelectorAll('.to-do');
                                todos.forEach((todo, index) => {
                                    if (index !== evt.oldIndex) { // Se não for o item arrastado
                                        todo.classList.add('faded');
                                    }
                                });
                            },
                            onEnd: function(evt) {
                                const todos = todoList.querySelectorAll('.to-do');
                                todos.forEach((todo) => {
                                    todo.classList.remove('faded'); // Remove a opacidade de todos
                                });
                                updateTodoOrder(); // Atualiza a ordem no Firestore
                            }
                        });
                        
                    });
            }

            function updateTodoOrder() {
                const todos = todoList.querySelectorAll('.to-do');
                todos.forEach((todoElement, index) => {
                    const todoId = todoElement.dataset.id;
                    db.collection("to-do").doc(todoId).update({
                        ordem: index
                    });
                });
            }          

            function deleteTodo(todoId) {
                db.collection("to-do").doc(todoId).delete().then(() => {
                    loadTodos();
                });
            }

            function applyDarkMode() {
                const items = document.querySelectorAll('#sidebar ul li');
                const usuario = document.getElementById('user');
                const botoes = document.querySelectorAll('.note-actions button');
                const toDoText = document.querySelectorAll('.to-do');
                const botaoDark = document.getElementById('dark-mode');
                const h3 = document.getElementById('h3');
                const sidebar = document.getElementById('sidebar');
                const insertToDo = document.querySelector(".insertToDo");
                const comandos = document.getElementById('comandos');
                const comandosHeader = document.querySelector('.comandos-header');
                
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');
                insertToDo.classList.remove('light-mode');
                insertToDo.classList.add('dark-mode');
                sidebar.classList.remove('light-mode');
                sidebar.classList.add('dark-mode');
                noteDetails.classList.remove('light-mode');
                noteDetails.classList.add('dark-mode');
                usuario.classList.remove('light-mode');
                usuario.classList.add('dark-mode');
                comandos.classList.remove('light-mode');
                comandos.classList.add('dark-mode');
                comandosHeader.classList.remove('light-mode');
                comandosHeader.classList.add('dark-mode');
                botaoDark.classList.remove('light-mode');
                botaoDark.classList.add('dark-mode');
                menu.classList.remove('light-mode');
                menu.classList.add('dark-mode');
                h3.style.color = "#DBDBDB";
                items.forEach(item => {
                    item.classList.remove('light-mode');
                    item.classList.add('dark-mode');
                });
                botoes.forEach(item => {
                    item.classList.remove('light-mode');
                    item.classList.add('dark-mode');
                });
                toDoText.forEach(item => {
                    item.classList.remove('light-mode');
                    item.classList.add('dark-mode');
                });
            }

            function applyLightMode() {
                const items = document.querySelectorAll('#sidebar ul li');
                const usuario = document.getElementById('user');
                const botoes = document.querySelectorAll('.note-actions button');
                const toDoText = document.querySelectorAll('.to-do');
                const botaoDark = document.getElementById('dark-mode');
                const h3 = document.getElementById('h3');
                const sidebar = document.getElementById('sidebar');
                const insertToDo = document.querySelector(".insertToDo");
                const comandos = document.getElementById('comandos');
                const comandosHeader = document.querySelector('.comandos-header');
                
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');
                insertToDo.classList.remove('dark-mode');
                insertToDo.classList.add('light-mode');
                sidebar.classList.remove('dark-mode');
                sidebar.classList.add('light-mode');
                noteDetails.classList.remove('dark-mode');
                noteDetails.classList.add('light-mode');
                usuario.classList.remove('dark-mode');
                usuario.classList.add('light-mode');
                comandos.classList.remove('dark-mode');
                comandos.classList.add('light-mode');
                comandosHeader.classList.remove('dark-mode');
                comandosHeader.classList.add('light-mode');
                botaoDark.classList.remove('dark-mode');
                botaoDark.classList.add('light-mode');
                menu.classList.remove('dark-mode');
                menu.classList.add('light-mode');
                h3.style.color = "#111";
                items.forEach(item => {
                    item.classList.remove('dark-mode');
                    item.classList.add('light-mode');
                });
                botoes.forEach(item => {
                    item.classList.remove('dark-mode');
                    item.classList.add('light-mode');
                });
                toDoText.forEach(item => {
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
                    li.innerHTML = (note.pinned ? "<i class='las la-thumbtack' style='font-size: 20px; color: #F44336;'></i>" : "") + (note.title || "Nova página");
                    li.dataset.id = note.id;
                    li.addEventListener("click", () => selectNote(note.id));
                    if (note.id === currentNoteId) {
                        li.classList.add("selected-note");
                    }
                    notesList.appendChild(li);
                });
                const items = document.querySelectorAll('#sidebar ul li');
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
                }
            }

            function getSelection() {
                return window.getSelection();
            }
        
            function saveSelection() {
                const selection = getSelection();
                if (selection.rangeCount > 0) {
                    return selection.getRangeAt(0);
                }
                return null;
            }
        
            function restoreSelection(range) {
                if (range) {
                    const selection = getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }

            function toggleLink() {
                const range = saveSelection();
                const url = prompt('Insira o link', 'https://');
                if (url) {
                    noteBody.focus();
                    restoreSelection(range);
                    
                    document.execCommand('createLink', false, url);
                    
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const linkElement = selection.anchorNode.parentElement;
                        if (linkElement.tagName === 'A') {
                            linkElement.setAttribute('contenteditable', 'false');
                            linkElement.setAttribute('target', '_blank');
                        }
                    }
                }
            }
            
            function toggleImage() {
                const range = saveSelection();
                const url = prompt('Insira o link da imagem');
                if (url) {
                    noteBody.focus();
                    restoreSelection(range);
                    document.execCommand('insertImage', false, url);
                }
            }

            function toggleHeading() {
                const selection = window.getSelection();
                let selectedNode = selection.anchorNode;
                
                while (selectedNode && selectedNode.nodeName !== 'H3' && selectedNode.nodeName !== 'BODY') {
                    selectedNode = selectedNode.parentNode;
                }
                
                if (selectedNode && selectedNode.nodeName === 'H3') {
                    document.execCommand('formatBlock', false, 'p');
                } else {
                    document.execCommand('formatBlock', false, 'h3');
                }
            }

            function toggleUnorderedList() {
                document.execCommand('insertUnorderedList');
            }

            function toggleRemoveFormat() {
                const range = saveSelection();
                if (range) {
                    noteBody.focus();
                    restoreSelection(range);
                    document.execCommand('removeFormat', false, null);
                }
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
                    })
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
                // Verifica se o elemento ativo é o noteBody
                if (event.ctrlKey && document.activeElement === noteBody) {
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
                        case 'k':
                            event.preventDefault();
                            toggleLink();
                            break;
                        case 'm':
                            event.preventDefault();
                            toggleImage();
                            break;
                        case 'e':
                            event.preventDefault();
                            toggleRemoveFormat();
                            break;
                    }
                }
            });

            function toggleSidebar(){
                document.getElementById("sidebar").classList.toggle('active');
                document.getElementById("overlay").classList.toggle('active');
            }

            document.getElementById("logout").addEventListener("click", () => {
                firebase.auth().signOut().then(() => {
                    window.location.href = "login.html";
                })
            });
        }
    });
});