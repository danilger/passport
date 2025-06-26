import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1750921315946 implements MigrationInterface {
    name = 'SchemaUpdate1750921315946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "fullName" character varying, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "isVerified" boolean NOT NULL DEFAULT false, "avatarUrl" character varying, "phoneNumber" character varying, "authProvider" character varying, "locale" character varying, "timezone" character varying, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_0cd11f0b35c4d348c6ebb9b36b7" PRIMARY KEY ("role_id", "permission_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7d2dad9f14eddeb09c256fea71" ON "roles_permissions" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_337aa8dba227a1fe6b73998307" ON "roles_permissions" ("permission_id") `);
        await queryRunner.query(`CREATE TABLE "user_roles_roles" ("userId" uuid NOT NULL, "rolesId" uuid NOT NULL, CONSTRAINT "PK_af39506d4797d25dbf41b29ea91" PRIMARY KEY ("userId", "rolesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0d0cc409255467b0ac4fe6b169" ON "user_roles_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7521d8491e7c51f885e9f861e0" ON "user_roles_roles" ("rolesId") `);
        await queryRunner.query(`ALTER TABLE "roles_permissions" ADD CONSTRAINT "FK_7d2dad9f14eddeb09c256fea719" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "roles_permissions" ADD CONSTRAINT "FK_337aa8dba227a1fe6b73998307b" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles_roles" ADD CONSTRAINT "FK_0d0cc409255467b0ac4fe6b1693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles_roles" ADD CONSTRAINT "FK_7521d8491e7c51f885e9f861e02" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles_roles" DROP CONSTRAINT "FK_7521d8491e7c51f885e9f861e02"`);
        await queryRunner.query(`ALTER TABLE "user_roles_roles" DROP CONSTRAINT "FK_0d0cc409255467b0ac4fe6b1693"`);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "FK_337aa8dba227a1fe6b73998307b"`);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "FK_7d2dad9f14eddeb09c256fea719"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7521d8491e7c51f885e9f861e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0d0cc409255467b0ac4fe6b169"`);
        await queryRunner.query(`DROP TABLE "user_roles_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_337aa8dba227a1fe6b73998307"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d2dad9f14eddeb09c256fea71"`);
        await queryRunner.query(`DROP TABLE "roles_permissions"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }

}
