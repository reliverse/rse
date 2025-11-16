import path from "@reliverse/pathkit";
import fs from "@reliverse/relifso";
import { addEnvVariablesToFile, type EnvVariable } from "../core/env-setup";
import type { ProjectConfig } from "../../types";

export async function setupPlanetScale(config: ProjectConfig) {
	const { projectDir, database, orm, backend } = config;

	const targetApp = backend === "self" ? "apps/web" : "apps/server";
	const envPath = path.join(projectDir, targetApp, ".env");

	if (database === "mysql" && orm === "drizzle") {
		const variables: EnvVariable[] = [
			{
				key: "DATABASE_URL",
				value:
					'mysql://username:password@host/database?ssl={"rejectUnauthorized":true}',
				condition: true,
			},
			{
				key: "DATABASE_HOST",
				value: "",
				condition: true,
			},
			{
				key: "DATABASE_USERNAME",
				value: "",
				condition: true,
			},
			{
				key: "DATABASE_PASSWORD",
				value: "",
				condition: true,
			},
		];

		await fs.ensureDir(path.join(projectDir, targetApp));
		await addEnvVariablesToFile(envPath, variables);
	}

	if (database === "postgres" && orm === "prisma") {
		const variables: EnvVariable[] = [
			{
				key: "DATABASE_URL",
				value: "postgresql://username:password@host/database?sslaccept=strict",
				condition: true,
			},
		];

		await fs.ensureDir(path.join(projectDir, targetApp));
		await addEnvVariablesToFile(envPath, variables);
	}

	if (database === "postgres" && orm === "drizzle") {
		const variables: EnvVariable[] = [
			{
				key: "DATABASE_URL",
				value:
					"postgresql://username:password@host/database?sslmode=verify-full",
				condition: true,
			},
		];

		await fs.ensureDir(path.join(projectDir, targetApp));
		await addEnvVariablesToFile(envPath, variables);
	}

	if (database === "mysql" && orm === "prisma") {
		const variables: EnvVariable[] = [
			{
				key: "DATABASE_URL",
				value: "mysql://username:password@host/database?sslaccept=strict",
				condition: true,
			},
		];

		await fs.ensureDir(path.join(projectDir, targetApp));
		await addEnvVariablesToFile(envPath, variables);
	}
}
