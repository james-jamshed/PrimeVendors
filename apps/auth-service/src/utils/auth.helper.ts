import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/prisma/redis";
import { sendEmail } from "./sendMail/indes";
import { NextFunction } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller")=>{
    const { name, email, password, phone_number, country } = data;

    if (!name || !email || !password || (userType == "seller" && !phone_number && !country)) {
        throw new ValidationError("Missing required fields!");
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format!");
    }
    
}

export const checkOtpRestriction = async (email: string, next: NextFunction) => {
    // Implement your OTP restriction logic here
    if (await redis.get(`otp_lock:${email}`)) {
        return next(new ValidationError("Account is temporarily locked Due to too many failed OTP attempts. Please try again later.")
        );
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("Too many OTP requests. Please try again 1 hour later again.")
        );
    }
    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError("Please wait 1 min before requesting a new OTP.")
        );
    }
}

export const trackOtpRequest = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);//lock for 1 hour
        return next(new ValidationError("Too many OTP requests. Please try again 1 hour later.")
        );
    }

    await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);//tracking request for 1 hour

};
export const sendOtp = async (name: string, email: string, template: string) => {
    // Implement your OTP sending logic here

    const otp = crypto.randomInt(1000, 9999).toString();
   await sendEmail(email, "Verify Your Email", template, { name, otp });
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
}