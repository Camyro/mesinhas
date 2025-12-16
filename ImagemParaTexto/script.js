const inputImage = document.querySelector('.input-image');
const btnAdcImage = document.querySelector('.btnAdcImagens');
const saidaTexto  = document.querySelector('.output-text');
const imagePreview = document.querySelector('.preview');
const barraProgresso = document.querySelector('.barraProgresso');

function controlarProgresso(n){
    barraProgresso.style.width = `${n}%`; 
}

async function extrairTexto(img){

  const worker = await Tesseract.createWorker('eng+por');
  const ret = await worker.recognize(img);
  console.log(ret.data.text);
  saidaTexto.value = ret.data.text;
  await worker.terminate();

}

btnAdcImage.addEventListener('click' , function(){
  inputImage.click();
})

inputImage.addEventListener('change' , function(){
    let fileImage = inputImage.files[0];

    imagePreview.src = URL.createObjectURL(fileImage);

    try{
      extrairTexto(fileImage);

    }catch(e){
        console.log('erro' , e);
    }

;})


