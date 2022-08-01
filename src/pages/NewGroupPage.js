// import ui
import CardFloat from "../components/ui/CardFloat";
import InputBox from "../components/ui/InputBox";
import CircleButton from "../components/ui/CircleButton";

function NewGroupPage() {
  return (
    <div className="bg-gray-700 w-full flex justify-center items-center bgHeroDiagDark">
      <CardFloat className="w-3/4 max-w-2xl">
        <div className="text-mexican-red-600 mb-2 font-montserrat font-semibold">
          New Group
        </div>
        <form className="flex flex-col">
          <label className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-400">
            Group Name
            <InputBox
              type={"text"}
              name={"group[name]"}
              placeholder={"Name"}
            ></InputBox>
          </label>
          <label className="mb-2 mt-1 text-lg font-medium text-gray-900 dark:text-gray-400">
            Image
            <InputBox
              type={"file"}
              name={"group[image]"}
              id={"image"}
            ></InputBox>
          </label>
          <div className="flex justify-end mt-2">
            <CircleButton type={"submit"}></CircleButton>
          </div>
        </form>
      </CardFloat>
    </div>
  );
}

export default NewGroupPage;
