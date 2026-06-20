using Application.UseCases.Auth.Login;
using Application.UseCases.Proyectos;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Auth — provided
        services.AddScoped<ILoginUseCase, LoginUseCase>();

        services.AddAutoMapper(typeof(DependencyInjection).Assembly);

        // TODO: Register your use cases here following the same pattern.
        // Example:
        // services.AddScoped<IGetProyectosPagedUseCase, GetProyectosPagedUseCase>();

        services.AddScoped<IGetProyectosPagedUseCase, GetProyectosPagedUseCase>();
        services.AddScoped<IGetProyectoByIdUseCase, GetProyectoByIdUseCase>();
        services.AddScoped<ICreateProyectoUseCase, CreateProyectoUseCase>();
        services.AddScoped<IUpdateProyectoUseCase, UpdateProyectoUseCase>();
        services.AddScoped<IDeleteProyectoUseCase, DeleteProyectoUseCase>();


        return services;
    }
}
