//import { render } from '@testing-library/react';
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

//this app will have 5 components
//1. number component
//2. breed component
//3. button to generate
//4. picture
//5. info column
 
const api_key = "REDACTED";
//for API key, refer to documentation on https://thecatapi.com/

// provides input field for number of pictures to be generated
function SelectNumber(props){
  return (
    <input onChange={props.change} type="number" autoComplete off autofocus name="number" placeholder="Number" min="1" max="100" required></input>
  );
}

//provides dropdown menu for cat breeds 
function Dropdown(props){
  const [Breed, setBreed] = useState(null);

  useEffect( () => { 
    async function getBreedData(){
      let breedData = await get_breed();
      let modifiedBreedData = breedData.map((breed) => (<option value={breed.id}>{breed.name}</option>));
      let options = (
        <select onChange={props.change}>
        <option disabled selected value="">Breed</option>
        {modifiedBreedData}
        </select>
      );
      setBreed(options);
    }

    if (!Breed){
      getBreedData();
    }
  });

  return Breed;
}

//provides generated picture
const Picture = (props) => {
  return <div><img src={props.url} alt="hello!" width="600" height="500"/></div>
}

//provides for the display of PICTURE + BREED INFO, if breed is selected
function Display(props){
  //eventually, props.pictures will become non null, we just need to wait for that to happen
  const [breedInfo, setBreedInfo] = useState(null);
  const [selectedBreed, setselectedBreed] = useState(null);

  useEffect( () => { 
    // this parses the breed info, if it is provided
    async function getBreedData(){
      const url = "https://api.thecatapi.com/v1/images/search?api_key=" + api_key + '&breed_ids=' + props.breed;
      let response = await fetch(url);
      let json_response = await response.json();
      let parsedinfo = (json_response[0].breeds)[0];
      setBreedInfo(
        <> 
          <div class="col-6">
            <p>Description: {parsedinfo.description}</p>
            <p>Weight: {parsedinfo.weight.metric} kg</p>  
            <p>Average Lifespan: {parsedinfo.life_span} years</p> 
          </div>
        </>);
      setselectedBreed(parsedinfo.id);
    }

    //function only triggers if 1. the selected breed was changed, or 2. there was no breed initially selected and one is subsequently chosen 
    if ((!breedInfo && props.breed) || selectedBreed != props.breed ){
      getBreedData();
    }
  }
  );
 
  if (props.pictures){
    let modifiedPictures = props.pictures.map((url) => (<Picture url={url}/>));
    
    if (breedInfo){
      return (
        <>
          <div class="row">
            <div class="col-6">
              {modifiedPictures}
            </div>
            <div class="col-6 text-start">
              {breedInfo}
            </div>
          </div>
        </>
      )
    }
    
    return (
      <>
        <div class="row">
            {modifiedPictures}
        </div>
      </>
    );
  } 
}


//overall application put together here
function App() {
  const [URL, setURL] = useState(null);
  const [number, setNumber] = useState(1);
  const [selectBreed, setselectBreed] = useState(null);
  const [refresh, setRefresh] = useState(false)

  useEffect( () => {
    async function formatPicture() { 
      let getData = await generate_image(selectBreed, number);
      //let modified_getData = getData.map((url) => (<Picture url={url}/>));
      setURL(getData);
      setRefresh(false);
    };
    
    if (!URL || refresh){
      formatPicture();
    };
  });
  
  return (
    <div>
      <div>
        <SelectNumber change={(event) => {
          setNumber(event.target.value);
          setRefresh(true);
        }}/>
      </div>
      <div>
        <Dropdown change={(event) => {
          setselectBreed(event.target.value);
          setRefresh(true);
        }}/>
      </div>
      <div>
        <Display
          pictures={URL}
          breed={selectBreed}  
        />
      </div>
    </div>
  );
}


//----------------------------------------------------------------------
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  //<React.StrictMode>
    <App />
  //</React.StrictMode>
);

async function generate_image(breed=null, count=1) {
  //api json result is given in a list, we need to iterate through the list and get the url 
  const setLimit = count > 1 ? ("limit=" + count) : null;
  const setBreed = breed ? ("breed_ids=" + breed) : null;
  const url = "https://api.thecatapi.com/v1/images/search?api_key=" + api_key + '&' + setLimit + "&" +  setBreed;
  let response = await fetch(url);
  let json_response = await response.json();
  let pictures = [];
  for (let picture of json_response){
    pictures.push(picture.url);
  } 
  return pictures;
}

async function get_breed() {
  const url = "https://api.thecatapi.com/v1/breeds";
  let response = await fetch(url);
  let json_response = await response.json();
  let breeds = [];
  for (let breed of json_response){
    breeds.push({id: breed.id, name: breed.name});
  }
  return breeds;
}