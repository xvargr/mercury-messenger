import NewGroupForm from "../components/forms/NewGroupForm";

const axios = require("axios").default;

function NewGroupPage() {
  function newGroupHandler(groupObject) {
    fetch(); //! complete POST http request, axios/firebase
    // todo: migrate to custom backend
  }

  return <NewGroupForm onNewGroup={newGroupHandler} />;
}

export default NewGroupPage;
