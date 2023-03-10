import React from "react";
import Header from "./components/Header.static#provider";
import TodosList from "./components/TodosList.static";
import ReactDOM, { hydrateRoot } from "react-dom/client";
import TodoDetails from "./components/TodoDetails.static#provider";
import { Provider } from "react-redux";
import store from "./redux/store.js";

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

const getData = (domEl, id) => {
  const json = domEl.getAttribute(`data-${id}`);
  try {
    const data = JSON.parse(json);
    return data;
  } catch (e) {
    console.error(`Can't parse ${json}`, e.message);
    return {};
  }
};

const main = () => {
  console.log("Environnement:", ENV);
  const headerId = "header";
  const header = get(headerId);
  if (header)
    injectInHtml(
      header,
      <Provider store={store}>
        <Header data={getData(header, headerId)} />
      </Provider>
    );

  const todosListId = "todosList";
  const todosList = get(todosListId);
  if (todosList)
    injectInHtml(
      todosList,
      <TodosList data={getData(todosList, todosListId)} />
    );

  const todoDetailsId = "todoDetails";
  const todoDetails = get(todoDetailsId);
  if (todoDetails)
    injectInHtml(
      todoDetails,
      <Provider store={store}>
        <TodoDetails data={getData(todoDetails, todoDetailsId)} />
      </Provider>
    );
};

window.addEventListener("load", main);
