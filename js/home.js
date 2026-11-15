/* Home page behaviour.
   One picture is on screen at a time; the Change image button
   walks through the three of them and wraps back to the first. */

// Path, alt text and caption kept together so all three swap at once.
const gallery = [
    {
        src: "../images/study-1.jpg",
        alt: "A desk set up for a revision session, with a laptop and lecture notes",
        caption: "Image 1 of 3: a desk set up for a revision session"
    },
    {
        src: "../images/study-2.jpg",
        alt: "A weekly plan with blocks for lectures and revision",
        caption: "Image 2 of 3: a week split into lecture and revision blocks"
    },
    {
        src: "../images/study-3.jpg",
        alt: "Task cards pinned in date order on a board",
        caption: "Image 3 of 3: deadlines pinned in date order"
    }
];

// Which picture is showing right now. Starts at 0 because the HTML
// already loads the first one.
let currentIndex = 0;

// Looked up once, not on every click.
const heroImage = document.getElementById("heroImage");
const imageCaption = document.getElementById("imageCaption");
const cycleButton = document.getElementById("cycleImageBtn");

// The modulo wraps the index back to 0 after the last picture, so the
// cycle never runs past the end of the array.
function showNextImage() {
    currentIndex = (currentIndex + 1) % gallery.length;

    const image = gallery[currentIndex];
    heroImage.src = image.src;
    heroImage.alt = image.alt;
    imageCaption.textContent = image.caption;
}

// The button is above this script, so it already exists by the time
// this line runs. That is why the script sits at the end of body.
cycleButton.addEventListener("click", showNextImage);