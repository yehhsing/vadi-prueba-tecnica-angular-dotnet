using Application.Common.Interfaces.Data;
using Dapper;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using System.Data;

namespace DataAccess.Repositories;

// TODO: Implement IProyectoRepository using Dapper.
// All queries MUST use stored procedures (CommandType.StoredProcedure).
// Follow the pattern in UsuarioRepository.cs

public class ProyectoRepository : IProyectoRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public ProyectoRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }
    // TODO: Inject IConfiguration and build SqlConnection the same way as UsuarioRepository
    public async Task<int> CreateAsync(Proyecto proyecto)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<int>(
            "sp_InsertarProyecto",
            new
            {
                proyecto.Nombre,
                proyecto.Descripcion,
                proyecto.FechaInicio,
                proyecto.FechaFin,
                proyecto.EstadoId,
                proyecto.CreadoPorId
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(
           "sp_EliminarProyecto",
           new { Id = id },
           commandType: CommandType.StoredProcedure
       );
    }

    public async Task<Proyecto?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Proyecto>(
            "sp_ObtenerProyectoPorId",
            new { Id = id },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<(IEnumerable<Proyecto> Items, int Total)> GetPagedAsync(int pagina, int tamanoPagina)
    {
        using var connection = _connectionFactory.CreateConnection();

        using var multi = await connection.QueryMultipleAsync(
            "sp_ListarProyectosPaginado",
            new
            {
                Pagina = pagina,
                TamanoPagina = tamanoPagina
            },
            commandType: CommandType.StoredProcedure
        );

        var items = await multi.ReadAsync<Proyecto>();
        var total = await multi.ReadSingleAsync<int>();

        return (items, total);

    }

    public async Task UpdateAsync(Proyecto proyecto)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(
            "sp_ActualizarProyecto",
            new
            {
                proyecto.Id,
                proyecto.Nombre,
                proyecto.Descripcion,
                proyecto.FechaInicio,
                proyecto.FechaFin,
                proyecto.EstadoId
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<bool> HasPendingOrInProgressTasksAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<bool>(
            "dbo.usp_ProyectoTieneTareasPendientesOEnProgreso",
            new { ProyectoId = id },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<bool> HasTasksNotCompletedOrCanceledAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<bool>(
            "dbo.usp_ProyectoTieneTareasNoFinalizadas",
            new { ProyectoId = id },
            commandType: CommandType.StoredProcedure
        );
    }
}
