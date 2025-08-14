
//Register a new user

import { NextFunction, Request, Response } from "express";
import { sendOtp, trackOtpRequest, checkOtpRestriction,validateRegistrationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
    const { name, email } = req.body;


    const existingUser = await prisma.users.findUnique({ where: email });

    if (existingUser) {
       return next(new ValidationError("User already exists with this email"));
    };
    await checkOtpRestriction(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(email, name, "user-activation-mail");

    res.status(200).json({
        message: "OTP sent to email. Please Verify Your Account."
    });
    }catch (error) {
       return next(error);
    }
};


