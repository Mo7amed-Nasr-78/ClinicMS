import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
	let controller: UsersController;
	let usersService: { getCurrentUser: jest.Mock };

	beforeEach(async () => {
		usersService = {
			getCurrentUser: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{ provide: UsersService, useValue: usersService },
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("should return the current user from the authenticated request", () => {
		const currentUser = { id: "user-123", email: "test@example.com" };
		usersService.getCurrentUser.mockReturnValue(currentUser);

		const request = { user: { sub: "user-123" } } as any;

		expect(controller.getCurrentUser(request)).toBe(currentUser);
		expect(usersService.getCurrentUser).toHaveBeenCalledWith(
			"user-123",
		);
	});
});
