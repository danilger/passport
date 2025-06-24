import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCascadeDelete1687793895000 implements MigrationInterface {
    name = 'RemoveCascadeDelete1687793895000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Удаляем существующие связи
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT IF EXISTS "FK_b36cb2e04bc81c3987a3d6f6e0c"`);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT IF EXISTS "FK_337aa8dba227a1fe6b73998307b"`);
        
        // Создаем новые связи без каскадного удаления
        await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "FK_b36cb2e04bc81c3987a3d6f6e0c"
            FOREIGN KEY ("permission_id")
            REFERENCES "permissions"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "FK_337aa8dba227a1fe6b73998307b"
            FOREIGN KEY ("role_id")
            REFERENCES "roles"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем связи без каскадного удаления
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT IF EXISTS "FK_b36cb2e04bc81c3987a3d6f6e0c"`);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT IF EXISTS "FK_337aa8dba227a1fe6b73998307b"`);
        
        // Возвращаем связи с каскадным удалением
        await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "FK_b36cb2e04bc81c3987a3d6f6e0c"
            FOREIGN KEY ("permission_id")
            REFERENCES "permissions"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "roles_permissions"
            ADD CONSTRAINT "FK_337aa8dba227a1fe6b73998307b"
            FOREIGN KEY ("role_id")
            REFERENCES "roles"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);
    }
} 