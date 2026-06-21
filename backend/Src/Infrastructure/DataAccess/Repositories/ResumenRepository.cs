using Application.Common.Interfaces.Data;
using Dapper;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using System.Data;

namespace DataAccess.Repositories;

public class ResumenRepository : IResumenRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public ResumenRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Resumen> GetAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QuerySingleAsync<Resumen>(
            "sp_ObtenerResumen",
            commandType: CommandType.StoredProcedure
        );
    }
}
