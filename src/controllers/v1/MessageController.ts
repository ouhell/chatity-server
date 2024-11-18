import { RequestHandler } from "express";
import { errorCatch } from "../../utils/errorCatch";
import prisma from "../../database/databaseClient";

// export const fetchMessages : RequestHandler = errorCatch( async (req , res ,next) => {
//          const user = req.session.user!;
//          const
//          const messages = prisma.message.findMany({
//             where : {

//             }
//          })
// })
