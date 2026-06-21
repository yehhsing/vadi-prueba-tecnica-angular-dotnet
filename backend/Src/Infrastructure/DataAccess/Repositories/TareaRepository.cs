using Application.Common.Interfaces.Data;
using Dapper;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using System.Data;

namespace DataAccess.Repositories;

// TODO: Implement ITareaRepository using Dapper.
// All queries MUST use stored procedures (CommandType.StoredProcedure).
// Follow the pattern in UsuarioRepository.cs
public class TareaRepository : ITareaRepository
{
    // TODO: Inject IConfiguration and build SqlConnection the same way as UsuarioRepository
    private readonly ISqlConnectionFactory _connectionFactory;

    public TareaRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<(IEnumerable<Tarea> Items, int Total)> GetPagedByProyectoAsync(
        int proyectoId,
        int pagina,
        int tamanoPagina)
    {
        using var connection = _connectionFactory.CreateConnection();

        using var multi = await connection.QueryMultipleAsync(
            "sp_ListarTareasPorProyectoPaginado",
            new
            {
                ProyectoId = proyectoId,
                Pagina = pagina,
                TamanoPagina = tamanoPagina
            },
            commandType: CommandType.StoredProcedure
        );

        var items = await multi.ReadAsync<Tarea>();
        var total = await multi.ReadSingleAsync<int>();

        return (items, total);
    }

    public async Task<Tarea?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<Tarea>(
            "sp_ObtenerTareaPorId",
            new { Id = id },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<int> CreateAsync(Tarea tarea)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleAsync<int>(
            "sp_InsertarTarea",
            new
            {
                tarea.ProyectoId,
                tarea.Titulo,
                tarea.Descripcion,
                tarea.PrioridadId,
                tarea.EstadoId,
                tarea.UsuarioAsignadoId,
                tarea.FechaLimite
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task UpdateAsync(Tarea tarea)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_ActualizarTarea",
            new
            {
                tarea.Id,
                tarea.ProyectoId,
                tarea.Titulo,
                tarea.Descripcion,
                tarea.PrioridadId,
                tarea.EstadoId,
                tarea.UsuarioAsignadoId,
                tarea.FechaLimite
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_EliminarTarea",
            new { Id = id },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task ChangeEstadoAsync(int id, int estadoId)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "sp_CambiarEstadoTarea",
            new
            {
                Id = id,
                EstadoId = estadoId
            },
            commandType: CommandType.StoredProcedure
        );
    }
}
