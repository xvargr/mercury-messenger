// this is a react component, it is a function that returns jsx, but otherwise
// is a normal js function
//
// you can use normal html elements in react components or other
// custom components and elements

import Card from "./components/Card";
import Modal from "./components/Modal";
import Backdrop from "./components/Backdrop";

function App() {
  return (
    <div>
      <h1>MERCURY</h1>
      <Card title="whoa" />
      <Card title="wow" />
      <Card title="wowza" />
      <Modal />
      <Backdrop />
    </div>
  );
}

export default App;
