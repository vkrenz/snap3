// const offset = "-80px"
// var prevScrollpos = window.pageYOffset
// window.onscroll = () => {
//     var currentScrollPos = window.pageYOffset
//     if (prevScrollpos > currentScrollPos) {
//         document.getElementById("navbar").style.top = "0"
//     } else {
//         document.getElementById("navbar").style.top = offset
//     }
//     prevScrollpos = currentScrollPos
// }

const heightOnScroll = "80px"
var prevScrollpos = window.pageYOffset
window.onscroll = () => {
    var currentScrollPos = window.pageYOffset
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("navbar").style.height = "100px"
    } else {
        document.getElementById("navbar").style.height = heightOnScroll
    }
    prevScrollpos = currentScrollPos
}