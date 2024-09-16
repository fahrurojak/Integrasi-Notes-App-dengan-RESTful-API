import AddNoteForm from './addNoteForm'
import NotesComponent from './notesComponent'
import FooterComponent from './footer'

// Create instances of AddNoteForm and NotesComponent outside the main function
const addNoteForm = new AddNoteForm()
const notesComponent = new NotesComponent()
const footer = new FooterComponent()

function main() {
  document.addEventListener('DOMContentLoaded', () => {
    const buttonSave = document.querySelector('#buttonSave')

    // Add an event listener for the “Save” button if the element is found
    if (buttonSave) {
      buttonSave.addEventListener('click', function () {
        const inputNotesTitle = document.querySelector('#inputNotesTitle')
        const inputNotesDescription = document.querySelector(
          '#inputNotesDescription',
        )

        const note = {
          title: inputNotesTitle.value,
          body: inputNotesDescription.value,
        }

        // Using the addNote method of AddNoteForm
        addNoteForm.addNote(note.title, note.body)
      })
    }

    // Append the footer component to the document body
    document.body.appendChild(footer)
  })
}

export default main
