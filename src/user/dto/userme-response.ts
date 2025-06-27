import { ApiProperty } from "@nestjs/swagger";

export class UserMeResponse {
    @ApiProperty()
    id: string;
  
    @ApiProperty()
    username: string;
  
    @ApiProperty({ type: [String] })
    roles: string[];
  }