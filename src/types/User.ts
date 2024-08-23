import { UsersName } from "stytch";

export interface UserProvider {
  oauth_user_registration_id: string;
  provider_subject: string;
  provider_type: string;
  profile_picture_url: string;
  locale: string;
}

export interface UserData {
  name?: UsersName;
  user_id: string;
  providers: UserProvider[];
}
