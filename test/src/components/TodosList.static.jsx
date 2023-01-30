import React from "react";

const TodosList = ({ data }) => {
  const getTodos = () => data.todos.filter((t) => t.id !== 2);

  return (
    <>
      <ul>
        {getTodos().map((t) => (
          <li key={t.id}>
            <p>{t.name}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TodosList;
