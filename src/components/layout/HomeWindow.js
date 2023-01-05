import React from "react";

const HomeWindow = () => {
  return (
    // h-full (100%) here causes unexpected behavior on mobile
    <div className="flex items-center justify-center">
      <div className="h-full w-full md:h-3/4 md:w-3/4 p-2 bg-gray-700 md:rounded-lg shadow-xl overflow-y-auto scrollbar-dark">
        <h1 className="text-mexican-red-700 text-4xl">TODOS:</h1>
        <ul className="list-disc ml-8">
          <li>mobile ui optimization</li>
          <li>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti
            sed nulla praesentium consequatur sequi nobis, quos dolorem porro
            itaque optio blanditiis deserunt deleniti ratione non, earum
            voluptatum, odio laboriosam ab? Rerum natus atque fugit pariatur!
            Provident fugiat ipsum ut, vero dolor velit iste nulla minus
            consequuntur doloremque non ipsam impedit quaerat officia deleniti
            aspernatur placeat expedita ad ullam delectus sint. Dolorem, vitae
            rem labore perferendis soluta culpa maiores veniam temporibus dolor
            nam libero explicabo ipsum possimus cupiditate nemo numquam vel
            delectus aliquam necessitatibus at! Velit aliquid sed amet quasi
            ipsum tenetur, assumenda distinctio possimus deleniti ratione
            doloribus modi laborum perferendis consequatur est voluptatum
            cupiditate nisi architecto repellat officia quod. Quis.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomeWindow;
