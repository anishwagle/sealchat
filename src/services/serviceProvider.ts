
import { friendService as friendServiceProvider } from "./friendService";
import { friendRecommendationService as friendRecommendationServiceProvider } from "./FriendRecommendationService";

import { IFriendService } from "./IFriendService";
import { IFriendRecommendationService } from "./IFriendRecommendationService";
import { postService as postServiceProvider } from "./postService";
import {config} from 'dotenv';
import { IPostService } from "./IPostService";
import { INotificationService } from "./INotificationService";
import {notificationService as notificationServiceProvider} from "./notificationService";
import { IEngagementService } from "./IEngagementService";
import {engagementService as engagementServiceProvider} from "./engagementService";
import {profileService as profileServiceProvider} from "./profileService";
import { IProfileService } from "./IProfileService";
config();

export const friendService:IFriendService =friendServiceProvider;
export const postService:IPostService = postServiceProvider;
export const notificationService:INotificationService = notificationServiceProvider;
export const engagementService:IEngagementService= engagementServiceProvider;
export const friendRecommendationService:IFriendRecommendationService = friendRecommendationServiceProvider;
export const profileService:IProfileService = profileServiceProvider;