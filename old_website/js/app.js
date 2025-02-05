// Avi Dixit 2021
// JS File that animates the intro header upon loading the page using TimeLineMax

const background = document.querySelector('.background');
const slider = document.querySelector('.slider');
const resume = document.querySelector('#resume');
const headline = document.querySelector('.headline');
const loading = document.querySelector('.loading')

const tl = new TimelineMax();

// Scrolls the page to the top when the user reloads the page
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

setTimeout(() => {
    loading.style.zIndex="-2"
    tl.fromTo(
        background,
        1,
        { height: '0%' },
        { height: '80%', ease: Power2.easeinOut }
)
    .fromTo(
        background,
        1.2,
        { width: '100%' },
        { width: '80%', ease: Power2.easeinOut }
    )
    .fromTo(
        headline,
        1.2,
        { opacity: 0 },
        { opacity: 1 },
        "-=1.2"
    )
    .fromTo(
        slider,
        1.2,
        { x: "-100%" },
        { x: "0%", ease: Power2.easeinOut },
        "-=1.2"
    )
    .fromTo(
        resume,
        1,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0 },
    );
}, 700);



    







