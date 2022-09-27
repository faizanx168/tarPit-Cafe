window.addEventListener('scroll', () =>{
    document.querySelector('nav').classList.toggle
    ('navigationConScroll', window.scrollY > 12)
    })
