import React from "react";
import {updateStore, listUpdateStrategyMethods} from "../utils/storeHelper";
import {batch} from "./_tester";

export default function () {
  const {UPDATE, REMOVE} = listUpdateStrategyMethods;
  const testResult = batch([
    //UPDATE STORE
    {
      params: [{id: 2, a: 1}, {id: 2, a: 2}, {method: UPDATE, by: "id"}],
      expect: {id: 2, a: 2},
      id: "Object updating with id found"
    },
    {
      params: [{id: 2, a: 1}, {id: 1, a: 1}, {method: UPDATE, by: ["id", "a"], or: true}],
      expect: {id: 1, a: 1},
      id: "Object updating with multiple or field [id, b] found"
    },
    {
      params: [{id: 2, a: 1, b: 2}, {id: 2, a: 2, b: 2}, {method: UPDATE, by: ["id", "b"]}],
      expect: {id: 2, a: 2, b: 2},
      id: "Object updating with multiple field [id, b] found"
    },
    {
      params: [{id: 2, a: 1}, {id: 4, a: 2}, {method: UPDATE, by: "id"}],
      expect: {id: 2, a: 1},
      id: "Object updating with id not found"
    },
    {
      params: [{id: 2, a: 1, c: 1}, {id: 2, a: 1, b: 1}, {method: UPDATE, by: "id", mix: true}],
      expect: {id: 2, a: 1, c: 1, b: 1},
      id: "Object updating with id found and mix"
    },
    {
      params: [{id: 2, a: 1, c: 1}, {id: 3, a: 1, b: 1}, {method: UPDATE, by: "id", mix: true}],
      expect: {id: 2, a: 1, c: 1},
      id: "Object updating with id not found and mix"
    },
    {
      params: [{id: 2, a: 1, b: 2}, {id: 2, a: 2, b: 3}, {method: UPDATE, by: ["id", "b"]}],
      expect: {id: 2, a: 1, b: 2},
      id: "Object updating with multiple field [id, b] not found"
    },
    {
      params: [[{id: 2, a: 1}], {id: 2, a: 2}, {method: UPDATE, by: "id"}],
      expect: [{id: 2, a: 2}],
      id: "Array updating with id"
    },
    {
      params: [[{id: 1, a: 1, c: 1}], {id: 1, a: 1, b: 1}, {method: UPDATE, by: "id", mix: true}],
      expect: [{id: 1, a: 1, c: 1, b: 1}],
      id: "Array updating with id and mix"
    },
    {
      params: [[{id: 2, a: 1, b: 1}], {id: 2, a: 2, b: 1}, {method: UPDATE, by: ["id", "b"]}],
      expect: [{id: 2, a: 2, b: 1}],
      id: "Array updating with multiple field [id, b]"
    },
    {
      params: [[{id: 2, a: 1, b: 1}], {id: 1, a: 2, b: 1}, {method: UPDATE, by: ["id", "b"], or: true}],
      expect: [{id: 1, a: 2, b: 1}],
      id: "Array updating with multiple or field [id, b]"
    },
    {
      params: [[{id: 2, a: 1}], {id: 3, a: 4}, {method: UPDATE, by: "id", upsert: true}],
      expect: [{id: 2, a: 1}, {id: 3, a: 4}],
      id: "Array updating with id and upsert"
    },
    {
      params: [[{id: 2, a: 1, b: 1}], {id: 2, a: 2, b: 2}, {method: UPDATE, by: ["id", "b"], upsert: true}],
      expect: [{id: 2, a: 1, b: 1}, {id: 2, a: 2, b: 2}],
      id: "Array updating with multiple field [id, b] and upsert"
    },
    {
      params: [[{id: 2, a: 1}, {id: 3, a: 2}], {id: 3, a: 3}, {method: UPDATE, by: "id"}],
      expect: [{id: 2, a: 1}, {id: 3, a: 3}],
      id: "Array multiple item updating with id found"
    },
    {
      params: [[{id: 2, a: 1}, {id: 3, a: 2}], {id: 4, a: 3}, {method: UPDATE, by: "id"}],
      expect: [{id: 2, a: 1}, {id: 3, a: 2}],
      id: "Array multiple item updating with id not found"
    },
    {
      params: [[{id: 2, a: 1, b: 1}, {id: 3, a: 2, b: 2}], {id: 3, a: 3, b: 2}, {method: UPDATE, by: ["id", "b"]}],
      expect: [{id: 2, a: 1, b: 1}, {id: 3, a: 3, b: 2}],
      id: "Array multiple item updating with id"
    },
    {
      params: [[{id: 2, a: 1}, {id: 3, a: 2}], {id: 4, a: 4}, {method: UPDATE, by: "id", upsert: true}],
      expect: [{id: 2, a: 1}, {id: 3, a: 2,}, {id: 4, a: 4}],
      id: "Array multiple item updating with id and upsert"
    },
    {
      params: [[{id: 2, a: 1}, {id: 3, a: 2}], [{id: 2, a: 3}], {method: UPDATE, by: "id"}],
      expect: [{id: 2, a: 3}, {id: 3, a: 2}],
      id: "Array updating by another Array by id"
    },
    {
      params: [[{id: 2, a: 1, b: 1}, {id: 3, a: 2}], [{id: 2, c: 1}], {method: UPDATE, by: "id", mix: true}],
      expect: [{id: 2, a: 1, b: 1, c: 1}, {id: 3, a: 2}],
      id: "Array updating by another Array by id and mix"
    },
    {
      params: [[{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}], [{id: 1, a: 3, b: 1}], {method: UPDATE, by: ["id", "b"]}],
      expect: [{id: 1, a: 3, b: 1}, {id: 2, a: 2, b: 2}],
      id: "Array updating by another Array by multiple field [id, b]"
    },
    {
      params: [[{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}], [{id: 0, a: 3, b: 1}], {method: UPDATE, by: ["id", "b"], or: true}],
      expect: [{id: 0, a: 3, b: 1}, {id: 2, a: 2, b: 2}],
      id: "Array updating by another Array by multiple or field [id, b]"
    },
    {
      params: [[{id: 2, a: 1}, {id: 3, a: 2}], [{id: 2, a: 3}, {id: 3, a: 4}], {method: UPDATE, by: "id"}],
      expect: [{id: 2, a: 3}, {id: 3, a: 4}],
      id: "Array updating by another Array by id and multiple match"
    },
    {
      params: [[{id: 2, a: 1}, {id: 3, a: 2}], [{id: 4, a: 3}], {method: UPDATE, by: "id", upsert: true}],
      expect: [{id: 2, a: 1}, {id: 3, a: 2}, {id: 4, a: 3}],
      id: "Array updating by another Array by id and upsert"
    },
    {
      params: [[{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}], [{id: 1, a: 3, b: 3}], {
        method: UPDATE,
        by: ["id", "b"],
        upsert: true
      }],
      expect: [{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}, {id: 1, a: 3, b: 3}],
      id: "Array updating by another Array by multiple field [id, b] and upsert"
    },

    // REMOVE
    {
      params: [[{id: 1, a: 1}, {id: 3, a: 2}], 1, {method: REMOVE, by: "id"}],
      expect: [{id: 3, a: 2}],
      id: "Array removing by another Value by id found"
    },
    {
      params: [[{id: 1, a: 1}, {id: 2, a: 2}], 3, {method: REMOVE, by: "id"}],
      expect: [{id: 1, a: 1}, {id: 2, a: 2}],
      id: "Array removing by another Value by id not found"
    },
    {
      params: [[{id: 1, a: 1}, {id: 2, a: 2}], 3, {method: REMOVE, by: "id"}],
      expect: [{id: 1, a: 1}, {id: 2, a: 2}],
      id: "Array removing by another Value by id not found"
    },
    {
      params: [[{id: 1, a: 1}, {id: 2, a: 2}], [1], {method: REMOVE, by: "id"}],
      expect: [{id: 2, a: 2}],
      id: "Array removing by another Array by id found"
    },
    {
      params: [[{id: 1, a: 1}, {id: 2, a: 2}], [3], {method: REMOVE, by: "id"}],
      expect: [{id: 1, a: 1}, {id: 2, a: 2}],
      id: "Array removing by another Array by id not found"
    },
    {
      params: [[{id: 1, a: 1}, {id: 2, a: 2}], [1, 2, 3], {method: REMOVE, by: "id"}],
      expect: [],
      id: "Array removing by another Array by id not found"
    },
    {
      params: [[{id: 1, a: 1}, {id: 2, a: 2}], [{id: 1}], {method: REMOVE, by: "id"}],
      expect: [{id: 2, a: 2}],
      id: "Array removing by another Array of Object by id found"
    },
    {
      params: [[{id: 1, a: 1}, {id: 2, a: 2}], [{id: 1}, {id: 2}], {method: REMOVE, by: "id"}],
      expect: [],
      id: "Array removing by another Array of multiple Object by id found"
    },
    {
      params: [[{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}], [{id: 2, b: 2}], {method: REMOVE, by: ["id", "b"]}],
      expect: [{id: 1, a: 1, b: 1}],
      id: "Array removing by another Array of Object by id found and multiple iten "
    },
    {
      params: [[{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}], [{id: 2, b: 2}], {method: REMOVE, by: ["id", "b"]}],
      expect: [{id: 1, a: 1, b: 1}],
      id: "Array removing by another Array of Object by id found and multiple item [id, b] found"
    },
    {
      params: [[{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}], [{id: 2, b: 3}], {method: REMOVE, by: ["id", "b"]}],
      expect: [{id: 1, a: 1, b: 1}, {id: 2, a: 2, b: 2}],
      id: "Array removing by another Array of Object by id found and multiple item [id, b] not found"
    },
    {
      params: [{id: 1, a: 1}, 1, {method: REMOVE, by: "id"}],
      expect: null,
      id: "Object removing by Singleton value by id found"
    },
    {
      params: [{id: 1, a: 1}, 2, {method: REMOVE, by: "id"}],
      expect: {id: 1, a: 1},
      id: "Object removing by Singleton value by id not found"
    },
    {
      params: [{id: 1, a: 1}, [1], {method: REMOVE, by: "id"}],
      expect: null,
      id: "Object removing by Array of value by id found"
    },
    {
      params: [{id: 1, a: 1}, [2, 4, 1], {method: REMOVE, by: "id"}],
      expect: null,
      id: "Object removing by multiple Array of value by id found"
    },
    {
      params: [{id: 1, a: 1}, [3], {method: REMOVE, by: "id"}],
      expect: {id: 1, a: 1},
      id: "Object removing by multiple Array of value by id not found"
    },
    {
      params: [{id: 1, a: 1}, [3, 4, 5], {method: REMOVE, by: "id"}],
      expect: {id: 1, a: 1},
      id: "Object removing by multiple Array of value by id not found"
    },

    //Exceptional situation
    {
      params: [null, null, {method: UPDATE, by: "id"}],
      expect: null,
      id: "Null update with null"
    },
    {
      params: [{id: 1, a: 1}, null, {method: UPDATE, by: "id"}],
      expect: {id: 1, a: 1},
      id: "Object updating by null"
    },
    {
      params: [null, {id: 1, a: 1}, {method: UPDATE, by: "id"}],
      expect: null,
      id: "Null updating by Object"
    }
  ], updateStore);

  return <pre>
    {testResult}
  </pre>;
}