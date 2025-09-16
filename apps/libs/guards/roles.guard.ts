import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "apps/auth/generated/prisma";



@Injectable()
export class RolesGuard implements CanActivate{
  constructor(private reflector: Reflector){}
  canActivate(context: ExecutionContext): boolean  {

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),
    ]);
  

    if(!requiredRoles) return true;
   
    const {user} = context.switchToHttp().getRequest();

    
    if(!user){
      throw new UnauthorizedException('No User In Request')
    }
    
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission for this route');
    }
    return true;
  }
}