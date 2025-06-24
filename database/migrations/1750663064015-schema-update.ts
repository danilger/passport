import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1750663064015 implements MigrationInterface {
    name = 'SchemaUpdate1750663064015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "FK_b36cb2e04bc81c3987a3d6f6e0c"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles_permissions" ADD CONSTRAINT "FK_b36cb2e04bc81c3987a3d6f6e0c" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
