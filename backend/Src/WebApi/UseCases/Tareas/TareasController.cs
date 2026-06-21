using Application.Common.Models;
using Application.UseCases.Tareas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.UseCases.Tareas;

[ApiController]
[Route("api/tareas")]
[Authorize]
public class TareasController : ControllerBase
{
    // TODO: Inject and use your Tarea use cases here.
    //
    // Required endpoints:
    //   GET    /api/tareas?proyectoId=1&pagina=1&tamanoPagina=10  — by project, paginated (all roles)
    //   GET    /api/tareas/{id}                                    — by id (all roles)
    //   POST   /api/tareas                                         — create [Authorize(Roles = "Administrador,Colaborador")]
    //   PUT    /api/tareas/{id}                                    — update [Authorize(Roles = "Administrador,Colaborador")]
    //   DELETE /api/tareas/{id}                                    — delete [Authorize(Roles = "Administrador")]
    //   PATCH  /api/tareas/{id}/estado                             — change status [Authorize(Roles = "Administrador,Colaborador")]

    private readonly IGetTareasPagedUseCase _getPagedUseCase;
    private readonly IGetTareaByIdUseCase _getByIdUseCase;
    private readonly ICreateTareaUseCase _createUseCase;
    private readonly IUpdateTareaUseCase _updateUseCase;
    private readonly IDeleteTareaUseCase _deleteUseCase;
    private readonly IChangeEstadoTareaUseCase _changeEstadoUseCase;

    public TareasController(
        IGetTareasPagedUseCase getPagedUseCase,
        IGetTareaByIdUseCase getByIdUseCase,
        ICreateTareaUseCase createUseCase,
        IUpdateTareaUseCase updateUseCase,
        IDeleteTareaUseCase deleteUseCase,
        IChangeEstadoTareaUseCase changeEstadoUseCase)
    {
        _getPagedUseCase = getPagedUseCase;
        _getByIdUseCase = getByIdUseCase;
        _createUseCase = createUseCase;
        _updateUseCase = updateUseCase;
        _deleteUseCase = deleteUseCase;
        _changeEstadoUseCase = changeEstadoUseCase;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int proyectoId,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanoPagina = 10)
    {
        var result = await _getPagedUseCase.Execute(
            new GetTareasPagedRequest(proyectoId, pagina, tamanoPagina)
        );

        return Ok(ApiResponse<PagedResult<TareaDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _getByIdUseCase.Execute(id);
        return Ok(ApiResponse<TareaDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,Colaborador")]
    public async Task<IActionResult> Create([FromBody] CreateTareaRequest request)
    {
        var id = await _createUseCase.Execute(request);
        return Ok(ApiResponse<int>.Ok(id));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador,Colaborador")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTareaRequest request)
    {
        await _updateUseCase.Execute(id, request);
        return Ok(ApiResponse<object?>.Ok(null));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(int id)
    {
        await _deleteUseCase.Execute(id);
        return Ok(ApiResponse<object?>.Ok(null));
    }

    [HttpPatch("{id:int}/estado")]
    [Authorize(Roles = "Administrador,Colaborador")]
    public async Task<IActionResult> ChangeEstado(int id, [FromBody] ChangeEstadoTareaRequest request)
    {
        await _changeEstadoUseCase.Execute(id, request);
        return Ok(ApiResponse<object?>.Ok(null));
    }
}
