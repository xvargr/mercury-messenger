export function clientValidator(value, type) {
  let feedback = "";
  let inpErr = true;

  if (type === "text") {
    // console.log(value.length);
    // console.log(type);
    if (!value) {
      inpErr = true;
      feedback = "A name is required";
    } else if (/[^\w\d ]+/.test(value)) {
      inpErr = true;
      feedback = "Title cannot contain special characters";
    } else if (value.length < 3) {
      inpErr = true;
      feedback = "Name must be longer than 3 characters";
    }
  }
  if (type === "radio") {
    if (!value) {
      inpErr = true;
      feedback = "Select a channel type";
    } else {
      inpErr = false;
      feedback = "Looks good";
    }
  }

  return [inpErr, feedback];
}
