import React from "react";
import Header from "./components/Header.static";
import TodosList from "./components/TodosList.static";
import ReactDOM, { hydrateRoot } from "react-dom/client";

const ENVS = { DEV: "development", PROD: "production" };

// const ENV = process.env.NODE_ENV || ENVS.DEV;
const ENV = ENVS.PROD;

const get = (id) => document.getElementById(id);

const injectInHtml = (domEl, component, isStatic = true) => {
  if (ENV === ENVS.PROD && isStatic) {
    hydrateRoot(domEl, component);
  } else {
    ReactDOM.createRoot(domEl).render(component);
  }
};

const main = () => {
  console.log("Environnement:", ENV);
  const header = get("header");
  if (header) injectInHtml(header, <Header />);

  const todosList = get("todosList");
  if (todosList) injectInHtml(todosList, <TodosList />);
};

window.addEventListener("load", main);
