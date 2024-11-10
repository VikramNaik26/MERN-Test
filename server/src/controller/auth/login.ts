import { RequestHandler } from 'express';

export const loginWrapper: RequestHandler = async (req, res) => {

  res.status(200).send("hello")

}
