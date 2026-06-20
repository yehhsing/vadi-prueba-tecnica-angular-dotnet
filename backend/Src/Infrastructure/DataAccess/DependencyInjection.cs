using Application.Common.Interfaces.Data;
using DataAccess.Database;
using DataAccess.Repositories;
using Domain.Interfaces.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DataAccess;

public static class DependencyInjection
{
    public static IServiceCollection AddDataAccessServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Auth — provided
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Missing connection string DefaultConnection.");

        services.AddSingleton<ISqlConnectionFactory>(
            _ => new SqlConnectionFactory(connectionString));


        // TODO: Register your repository implementations here.
        // Example:
         services.AddScoped<IProyectoRepository, ProyectoRepository>();
        // services.AddScoped<ITareaRepository, TareaRepository>();
        // services.AddScoped<IResumenRepository, ResumenRepository>();

        return services;
    }
}
