export function hasPermission(
	userPermissions: readonly string[] | null | undefined,
	requiredPermission: string,
): boolean {
	return userPermissions?.includes(requiredPermission) ?? false;
}
