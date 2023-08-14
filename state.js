import { Storage } from "./storage";

export default {
  _mouseDownIntention: "click",
  get mouseDownIntention() {
    return this._mouseDownIntention;
  },
  set mouseDownIntention(value) {
    this._mouseDownIntention = value;
  },

  _storage: new Storage(),
  get storage() {
    return this._storage;
  },
  set storage(value) {
    this._storage = value;
  },

  _topLevelComments: [],
  get topLevelComments() {
    return this._topLevelComments;
  },
  set topLevelComments(value) {
    this._topLevelComments = value;
  },

  _comments: [],
  get comments() {
    return this._comments;
  },
  set comments(value) {
    this._comments = value;
  },
};
