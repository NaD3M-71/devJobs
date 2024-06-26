import axios from "axios";
import Swal from "sweetalert2";


document.addEventListener('DOMContentLoaded', ()=> {
    const skills = document.querySelector('.lista-conocimientos');
    
    //Limpiar las alertas
    let alertas = document.querySelector('.alertas');

    if(alertas){
        limpiarAlertas();
    }

    // Evento agregar skills
    if(skills){
        skills.addEventListener('click', agregarSkills);

        // una vez que estamos en editar llamar la funcion
        skillsSelecionados()

    }

    // 
    const vacantesListado = document.querySelector('.panel-administracion');

    if(vacantesListado){
        vacantesListado.addEventListener('click', accionesListado);
    }
})

const skills = new Set();
const agregarSkills = e =>{
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            //quitarlo del set y quitar la clase
            skills.delete(e.target.textContent)
            e.target.classList.remove('activo');
        }else{
            //agregarlo al set y agregar clase
            skills.add(e.target.textContent)
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills] // Set devuelve un objeto y de esta forma convertimos el objeto en un array mas facil de leer para nuestra app
    document.querySelector('#skills').value = skillsArray;
}

const skillsSelecionados = ()=>{
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
    
    seleccionadas.forEach(seleccionada =>{
        skills.add(seleccionada.textContent)
    })
    // inyectarlo al input hidden
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}


const limpiarAlertas = ()=>{
    const alertas = document.querySelector('.alertas');

    const interval = setInterval(()=>{
        if(alertas.children.length > 0){
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length == null){
            alertas.parentElement.removeChild(alertas);
            clearInterval();
        }
    },2000);
}

// Eliminar vacantes
const accionesListado = e => {
    
    if(e.target.dataset.eliminar){
        e.preventDefault()
        // eliminar por axios
        Swal.fire({
            title: '¿Confirmar Eliminación?',
            text: "Una vez eliminada, no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar',
            cancelButtonText : 'No, Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {

                // enviar la petición con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                // Axios para eliminar el registro
                axios.delete(url, { params: {url} })
                    .then(function(respuesta) {
                        if(respuesta.status === 200) {
                            Swal.fire(
                                {title:'Eliminado',
                                icon: 'success'
                            }
                            );

                            //Eliminar del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            icon:'error',
                            title: 'Hubo un error',
                            text: 'No Se pudo eliminar'
                        })
                    })



             
            }
          })
    }  
    // else {
    //     window.location.href = e.target.href
    // }
}