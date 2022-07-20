// function name should be Capitalized to differentiate components from built in
// html elements

import { useState } from "react";

// props is an object containing key value pair that are set when this component
// is called, here the title is passed in from the title attribute on the jsx
// on ap.js

// to treat lines as js, use {}, no blocks are allowed though
function Card(props) {
  useState(false); // react hook that create a state that react is aware of
  // the modal should be closed by default and only open when the delete button
  // is pressed

  // you can make an inline function where needed as an attribute, or point to
  // a function (not execute, no parentheses "()") on any element.
  // this is because all elements in react jsx are also react components under
  // the hood
  function deleteHandler() {
    // when button is clicked, change to state where modal is open
    console.log(`clicked ${props.title}`);
  }

  return (
    <div className="card">
      <h2>{props.title}</h2>
      <div className="cardActions">
        <button onClick={deleteHandler}>delete</button>
      </div>
    </div>
  );
  // keep components small and maintainable, split up components into smaller
  // self contained ones
}

export default Card;
