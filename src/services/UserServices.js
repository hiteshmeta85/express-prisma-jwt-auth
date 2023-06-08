// User Services

import { db } from '../utils/db.js';

export function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

export function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}
