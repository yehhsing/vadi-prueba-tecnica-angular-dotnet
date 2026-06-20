using System.Data;


namespace Application.Common.Interfaces.Data
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
