import React from "react";

const TodosList = () => {
  const todos = [
    {
      id: 1,
      name: "todo 1",
      completed: false,
    },
    {
      id: 2,
      name: "todo 2",
      completed: false,
    },
    {
      id: 3,
      name: "todo 3",
      completed: true,
    },
  ];

  return (
    <>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <p>{t.name}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TodosList;
