export default class NotesComponent extends HTMLElement {
  constructor() {
    super()
    this.notes = [] // Initialization of record data
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    document.addEventListener(
      'newNoteAdded',
      this.handleNewNoteAdded.bind(this),
    )
    this.renderLoading() // Show loading when components are connected
    setTimeout(() => {
      this.fetchNotes() // Call the method to retrieve records from the server after 2 seconds
    }, 2000) // Reduced delay time to 2 seconds
  }

  fetchNotes() {
    fetch('https://notes-api.dicoding.dev/v2/notes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch notes')
        }
        return response.json()
      })
      .then((data) => {
        this.notes = data.data
        this.renderNotes()
      })
      .catch((error) => {
        console.error('Error fetching notes:', error)
        this.renderError()
      })
  }

  fetchSingleNote(noteId) {
    return fetch(`https://notes-api.dicoding.dev/v2/notes/${noteId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch single note')
        }
        return response.json()
      })
      .then((data) => {
        if (!data.data) {
          throw new Error('Note data is null')
        }
        return data.data
      })
  }

  fetchArchivedNotes() {
    return fetch('https://notes-api.dicoding.dev/v2/notes/archived')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch archived notes')
        }
        return response.json()
      })
      .then((data) => {
        return data.data
      })
  }

  renderNotes() {
    const notesContainer = document.createElement('div')
    notesContainer.id = 'notes-container'

    this.notes.forEach((note, index) => {
      const noteElement = document.createElement('div')
      noteElement.classList.add('note-content')
      noteElement.innerHTML = `
                <h2>${note.title}</h2>
                <p>${note.body}</p>
                <p>Created at: ${note.createdAt}</p>
                <p>Archived: ${note.archived}</p> 
                <button class="delete-button" data-note-id="${note.id}">Delete Note</button>
                <button class="detail-button" data-note-id="${note.id}">View Detail</button>
            `

      // Adding modern and powerful animation with anime.js
      noteElement.style.opacity = 0
      noteElement.style.transform = 'translateY(20px)' // Initial translation for a smoother start

      anime({
        targets: noteElement,
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'cubicBezier(0.25, 0.1, 0.25, 1)', // More modern easing effect
        duration: 700, // Slightly longer duration for a smoother effect
        delay: index * 120, // Increased delay for better staggered animation
        elasticity: 400, // Adds a subtle bounce effect for a more dynamic feel
      })

      notesContainer.appendChild(noteElement)
    })

    const style = document.createElement('style')
    style.textContent = `
    #notes-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
        justify-content: space-between;
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: #1f1f1f;
        margin-bottom: 40px; /* Add space between the container and the footer */
    }

    #notes-container:before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-radius: 12px;
        padding: 1px;
        background: linear-gradient(270deg, #3936f4, #f44336, #1B9154);
        background-size: 600% 600%;
        animation: gradient-border 8s ease infinite;
        mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        mask-composite: exclude;
        -webkit-mask-composite: destination-out;
    }

    @keyframes gradient-border {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    
    .note-content {
        background-color: #121212;
        color: #e5e5ea;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        padding: 20px;
        box-sizing: border-box;
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
         border: 2px solid white;
    }

    .note-content:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    }
    .delete-button {
        background-color: #ff3b3b;
        color: #333;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
    }

    .delete-button:hover {
        background-color: #d32f2f;
    }

    .detail-button {
        background-color: #fff263;
        color: #333;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
    }

    .detail-button:hover {
        background-color: #e0c73b;
    }
        `

    // Clear the shadow DOM before adding a new element
    this.shadowRoot.innerHTML = ''
    this.shadowRoot.appendChild(style)
    this.shadowRoot.appendChild(notesContainer)

    // Add event listener for delete button
    notesContainer.querySelectorAll('.delete-button').forEach((button) => {
      button.addEventListener('click', this.handleDeleteNote.bind(this))
    })

    // Add event listener for “View Detail” button
    notesContainer
      .querySelectorAll('.detail-button')
      .forEach((detailButton) => {
        detailButton.addEventListener('click', this.handleViewDetail.bind(this))
      })
  }

  renderError() {
    const errorContainer = document.createElement('div')
    errorContainer.textContent =
      'Failed to fetch notes. Please try again later.'
    this.shadowRoot.appendChild(errorContainer)
  }

  renderLoading() {
    const loadingIndicator = document.createElement('div')
    loadingIndicator.id = 'loadingIndicator'
    loadingIndicator.innerHTML = '<div class="loading-spinner"></div>'
    this.shadowRoot.appendChild(loadingIndicator)

    const style = document.createElement('style')
    style.textContent = `
    .loading-spinner {
        border: 4px solid rgba(255, 255, 255, 0.2);
        border-top-color: #4a90e2; /* Modern blue shade */
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s cubic-bezier(0.4, 0.0, 0.2, 1) infinite; /* Smoother animation */
        margin: auto;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.1)); /* Subtle gradient */
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2); /* Softer shadow for depth */
    }

    @keyframes spin {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }
        `
    this.shadowRoot.appendChild(style)
  }

  handleNewNoteAdded(event) {
    const { title, body } = event.detail
    // Add a new note to the note list
    const newNote = {
      title,
      body,
      createdAt: new Date().toISOString(),
      archived: false,
    }
    this.notes.push(newNote)
    // Re-render the record list
    this.renderNotes()
  }

  handleDeleteNote(event) {
    const noteId = event.target.dataset.noteId
    fetch(`https://notes-api.dicoding.dev/v2/notes/${noteId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete note')
        }
        return response.json()
      })
      .then((data) => {
        // Remove a note from the note list
        this.notes = this.notes.filter((note) => note.id !== noteId)
        // Re-render the list of records
        this.renderNotes()
        console.log('Note deleted successfully:', data) // Display a message to the console if the deletion was successful
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Note deleted successfully',
        })
      })
      .catch((error) => {
        console.error('Error deleting note:', error)
        // Show error message if an error occurs while deleting a record
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete note',
        })
      })
  }

  handleViewDetail(event) {
    const noteId = event.target.dataset.noteId
    this.fetchSingleNote(noteId)
      .then((note) => {
        // Show note details
        console.log('Note Detail:', note)
        // Display note details using alerts
        Swal.fire({
          title: note.title,
          html: `
                        <p><strong>Body:</strong> ${note.body}</p>
                        <p><strong>Created at:</strong> ${note.createdAt}</p>
                        <p><strong>Archived:</strong> ${note.archived}</p>
                    `,
          showCloseButton: true,
          showCancelButton: false,
          focusConfirm: false,
          confirmButtonText: 'Close',
        })
      })
      .catch((error) => {
        console.error('Error fetching single note:', error)
        // Display an error message if an error occurs while retrieving record details
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch note detail',
        })
      })
  }
}

customElements.define('notes-component', NotesComponent)
