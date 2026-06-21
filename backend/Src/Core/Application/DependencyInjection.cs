using Application.UseCases.Auth.Login;
using Application.UseCases.Proyectos;
using Application.UseCases.Tareas;
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

        services.AddScoped<IGetTareasPagedUseCase, GetTareasPagedUseCase>();
        services.AddScoped<IGetTareaByIdUseCase, GetTareaByIdUseCase>();
        services.AddScoped<ICreateTareaUseCase, CreateTareaUseCase>();
        services.AddScoped<IUpdateTareaUseCase, UpdateTareaUseCase>();
        services.AddScoped<IDeleteTareaUseCase, DeleteTareaUseCase>();
        services.AddScoped<IChangeEstadoTareaUseCase, ChangeEstadoTareaUseCase>();

        return services;
    }
}
