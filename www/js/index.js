document.addEventListener("deviceready", () => { //cuando el dispositivo esté listo
    let takePhotoButton=document.querySelector("#take-photo");
    let clearPhotoButton=document.querySelector("#clear-photo");
    let photoGalery=document.querySelector("#photo-galery");

    //declaramos un contador de fotos para generar un id y poder borrar o descargar
    let photoIdCounter=getNextPhotoId(); //Una funcion.

    //¿Que pasa si le das click al boton tomar foto? =>
    takePhotoButton.addEventListener("click", ()=> {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 90,
            destinationType: Camera.DestinationType.DATA_URL
        });

        function onSuccess(imageData) {
            const dataUrl = "data:image/jpeg;base64" + imageData;
            const photoId = photoIdCounter;
            guardarFoto({id: photoId, dataUrl});
            setNextPhotoId(photoIdCounter);
        }

        function onFail(message) {
            alert("Ha fallado: " + message);
        }
    });
    
    function guardarFoto(photo, isFromLoad=false){
        //crear un contenedor donde guardar la foto
        const photoContainer=document.createElement("div");
        photoContainer.className="photo-container";
        photoContainer.dataset.id=photo.id;

        //crear la imagen
        const img=new Image();//La imagen como objeto
        img.src=photo.dataUrl;
        img.className="photo";
        //como cada foto tiene sus botones de descargar o eliminar se crean junto con la foto
        const buttonContainer=document.createElement("div");
        buttonContainer.className="photo-buttons";

        //creamos el boton de eliminar
        const deleteButton=document.createElement("button");
        deleteButton.classList.add("delete-photo");
        deleteButton.textContent="Eliminar";
        deleteButton.addEventListener("click",()=>{
            eliminarPhoto(photo.id);//nos identifica con la id la photo a eliminar
        });

        //crear el boton de descargar la foto
        const downloadPhoto=document.createElement("button");
        downloadPhoto.classList.add("download-photo");
        downloadPhoto.textContent="Descargar";
        downloadPhoto.addEventListener("click",()=>{
            descargarPhoto(photo.dataUrl,`foto-${photo.id}.jpg`);
        })

        buttonContainer.appendChild(downloadPhoto);
        buttonContainer.appendChild(deleteButton);
        photoContainer.appendChild(img);
        photoContainer.appendChild(buttonContainer);
        photoGalery.appendChild(photoContainer);

        //guardar la photo en el almacenamiento local
        //hacemos un condicional para que no dupliquen las fotos
        if (!isFromLoad) {// si es true es que se tiene cargado ya del localStorage
            const fotos = JSON.parse(localStorage.getItem("fotos")) || [];
            fotos.push(photo);
            localStorage.setItem("fotos", JSON.stringify(fotos));
        }

    }
    function eliminarPhoto(id){
        //eliminar photo del DOM
        //dejarlo de mostrar
        const photoContainer=document.querySelector(`.photo-container[data-id="${id}"]`);
        if (photoContainer){
            photoGalery.removeChild(photoContainer);
        }
        //eliminarlo del localStorage
        let fotos=JSON.parse(localStorage.getItem("fotos")) || [];
        fotos=fotos.filter(photo=>photo.id !== id);
        localStorage.setItem("fotos",JSON.stringify(fotos));
    }


    /*
    * Funcion para crear un tipo link en el body y ejecutarlo para descargar la foto solicitada.
    * */
    function descargarPhoto(dataUrl,nombreArchivo){
        const a=document.createElement("a");
        a.href=dataUrl; //crea un link
        a.download=nombreArchivo; //tipo download
        document.body.appendChild(a); //lo termina de crear
        a.click(); //como si el usuario pulsara clic
        document.body.removeChild(a); //lo elimina

    }
    /*
    * Activar el evento para que cuando se pulse clic sobre borrar todas las fotos, se eliminen todas
    * */

    clearPhotoButton.addEventListener("click",()=>{
        localStorage.removeItem("fotos");
        while (photoGalery.firstChild){
            photoGalery.removeChild(photoGalery.firstChild);
        }
        photoIdCounter=0;
        setNextPhotoId(photoIdCounter);
    })

    //cargar las fotos guardadas al iniciar la aplicacion
    const fotosGuardadas=JSON.parse(localStorage.getItem("fotos")) || [];
    fotosGuardadas.forEach(photo=>{
        guardarFoto(photo,true); //para evitar duplicacion de las fotos
    })

    //obtiene  el valor en el localStorage con el nuevo valor convertido
    function getNextPhotoId(){
        return parseInt(localStorage.getItem("photoIdCounter")) || 0;

    }
    //asigna el valor en el localStorage con la nueva cadena
    function setNextPhotoId(id){
        localStorage.setItem("photoIdCounter", id.toString());
    }
});